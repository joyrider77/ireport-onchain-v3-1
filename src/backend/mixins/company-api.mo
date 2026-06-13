// Öffentliche API für Firmen- und Mitarbeiterverwaltung
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import AccessControl "mo:caffeineai-authorization/access-control";
import EmailClient "mo:caffeineai-email/emailClient";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import MasterTypes "../types/masterdata";
import TrackingTypes "../types/timetracking";
import AuditTypes "../types/audit";
import MasterLib "../lib/masterdata";
import CompanyLib "../lib/company";
import AccessControlLib "../lib/AccessControlLib";
import InputValidator "../lib/InputValidator";
import CostDashboardTypes "../types/cost-dashboard";
import Order "mo:core/Order";
import ComplianceTypes "../types/compliance";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  companySettings : Map.Map<CommonTypes.CompanyId, CompanyTypes.CompanySettings>,
  userNotifSettings : Map.Map<Principal, CompanyTypes.UserNotificationSettings>,
  nextCompanyId : { var value : Nat },
  nextEmployeeId : { var value : Nat },
  // Stammdaten werden hier für die Auto-Initialisierung benötigt
  customers : List.List<MasterTypes.Customer>,
  projects : List.List<MasterTypes.Project>,
  projectMembers : Map.Map<CommonTypes.ProjectId, [MasterTypes.ProjectMemberAssignment]>,
  serviceTypes : List.List<MasterTypes.ServiceType>,
  expenseTypes : List.List<MasterTypes.ExpenseType>,
  absenceTypes : List.List<MasterTypes.AbsenceType>,
  holidays : List.List<MasterTypes.Holiday>,
  nextCustomerId : { var value : Nat },
  nextProjectId : { var value : Nat },
  nextServiceTypeId : { var value : Nat },
  nextExpenseTypeId : { var value : Nat },
  nextAbsenceTypeId : { var value : Nat },
  nextHolidayId : { var value : Nat },
  // Neue Zustands-Slices für Beschäftigungen, Ferienguthaben, Zeitsaldokorrekturen
  employments : List.List<CompanyTypes.Employment>,
  vacationBalances : List.List<CompanyTypes.VacationBalance>,
  timeBalanceCorrections : List.List<CompanyTypes.TimeBalanceCorrection>,
  nextEmploymentId : { var value : Nat },
  nextVacationBalanceId : { var value : Nat },
  nextTimeCorrectionId : { var value : Nat },
  // Für Arbeitszeitsaldo-Berechnung
  timeEntries : List.List<TrackingTypes.TimeEntry>,
  absences : List.List<TrackingTypes.Absence>,
  expenses : List.List<TrackingTypes.Expense>,
  // Platform Admin State
  platformAdminPrincipal : { var value : ?Principal },
  platformAdminCreatedAt : { var value : Int },
  // Audit-Log (append-only)
  auditLogEntries : List.List<AuditTypes.AuditLogEntry>,
  nextAuditLogId : { var value : Nat },
  // Standard-Arbeitsstunden pro Firma
  defaultWorkHoursMap : Map.Map<CommonTypes.CompanyId, CompanyTypes.DefaultWorkHours>,
  // Abonnement-Zustände für Auto-Zuweisung
  subscriptionPlans : Map.Map<Text, CostDashboardTypes.SubscriptionPlan>,
  subscriptionPlansInitialized : { var value : Bool },
  companySubscriptions : Map.Map<Text, Text>,
  companySubscriptionDetails : Map.Map<Text, CostDashboardTypes.CompanySubscription>,
  principalToCompanyRef : Map.Map<Principal, CommonTypes.CompanyId>,
  // Auto-Init Compliance-Profil fuer neue Mitarbeiter
  complianceProfiles     : List.List<ComplianceTypes.EmployeeComplianceProfile>,
  nextComplianceProfileId : { var value : Nat },
) {
  // Hilfsfunktionen: Plan-Auto-Zuweisung (synchron, keine async-Abhängigkeit)
  private func platformAdminCompanyId_() : ?CommonTypes.CompanyId {
    switch (platformAdminPrincipal.value) {
      case null { null };
      case (?pa) { principalToCompanyRef.get(pa) };
    };
  };

  private func isPlatformAdminCompany_(companyId : CommonTypes.CompanyId) : Bool {
    switch (platformAdminCompanyId_()) {
      case null { false };
      case (?paId) { paId == companyId };
    };
  };

  // autoAssignPlan_ removed — plan changes now require explicit user confirmation via applyPlanChange();

  // Hilfsfunktion: Authentifizierung prüfen
  private func requireCompanyId(caller : Principal) : CommonTypes.CompanyId {
    switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
  };

  // Hilfsfunktion: Rolle des Aufrufers prüfen (delegiert an AccessControlLib)
  private func requireRole(caller : Principal, companyId : CommonTypes.CompanyId, allowedRoles : [CommonTypes.Role]) : () {
    let company = switch (companies.find(func(c : CompanyTypes.Company) : Bool = c.id == companyId)) {
      case null { Runtime.trap("Firma nicht gefunden") };
      case (?c) c;
    };
    switch (AccessControlLib.requireRole(caller, company, allowedRoles, principalToEmployee, employees)) {
      case (#err(msg)) { Runtime.trap(msg) };
      case (#ok(_)) {};
    };
  };

  // Hilfsfunktion: Name des Aufrufers ermitteln (für Audit-Log)
  private func callerNameCompany(caller : Principal, companyId : CommonTypes.CompanyId) : Text {
    switch (principalToEmployee.get(caller)) {
      case null { caller.toText() };
      case (?empId) {
        switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
          case null { caller.toText() };
          case (?e) { e.firstName # " " # e.lastName };
        };
      };
    };
  };

  // Hilfsfunktion: Audit-Log-Eintrag anhängen (mit optionalen Feldänderungen)
  private func appendCompanyAudit(
    caller      : Principal,
    companyId   : CommonTypes.CompanyId,
    entityType  : AuditTypes.AuditEntityType,
    operation   : AuditTypes.AuditOperation,
    entityId    : Text,
    beforeState : ?Text,
    afterState  : ?Text,
  ) {
    appendCompanyAuditWithChanges(caller, companyId, entityType, operation, entityId, beforeState, afterState, null);
  };

  private func appendCompanyAuditWithChanges(
    caller       : Principal,
    companyId    : CommonTypes.CompanyId,
    entityType   : AuditTypes.AuditEntityType,
    operation    : AuditTypes.AuditOperation,
    entityId     : Text,
    beforeState  : ?Text,
    afterState   : ?Text,
    fieldChanges : ?[AuditTypes.AuditFieldChange],
  ) {
    let id = "AL-" # nextAuditLogId.value.toText();
    nextAuditLogId.value += 1;
    let entry : AuditTypes.AuditLogEntry = {
      id;
      companyId;
      timestamp      = Time.now();
      operation;
      entityType;
      entityId;
      actorPrincipal = caller.toText();
      actorName      = callerNameCompany(caller, companyId);
      beforeState;
      afterState;
      fieldChanges;
    };
    auditLogEntries.add(entry);
  };

  // Serialisierung Mitarbeiter für Audit
  private func employeeToText(e : CompanyTypes.Employee) : Text {
    let deactivatedPart = switch (e.deactivatedAt) {
      case null { "" };
      case (?ts) { " deactivatedAt=" # ts.toText() };
    };
    "id=" # e.id.toText() # " name=" # e.firstName # " " # e.lastName
    # " role=" # (switch (e.role) { case (#admin) "admin"; case (#manager) "manager"; case (#employee) "employee" })
    # " active=" # (if (e.active) "true" else "false")
    # deactivatedPart;
  };

  // Serialisierung Firma für Audit
  private func companyToText(c : CompanyTypes.Company) : Text {
    "id=" # c.id.toText() # " name=" # c.name
    # " isActive=" # (if (c.isActive) "true" else "false");
  };

  // Prüft ob der Caller bereits registriert ist
  public query ({ caller }) func isRegistered() : async Bool {
    CompanyLib.isRegistered(principalToCompany, caller);
  };

  // Registriert eine neue Firma und den ersten Admin-Benutzer
  public shared ({ caller }) func registerCompany(
    name : Text,
    firstName : Text,
    lastName : Text,
    email : Text,
    planId : ?Text,
    billingModel : ?Text,
  ) : async CommonTypes.Result<CompanyTypes.Company> {
    if (CompanyLib.isRegistered(principalToCompany, caller)) {
      return #err("Diese Identität ist bereits registriert");
    };
    // Beim allerersten Aufruf (keine Firma vorhanden) den Caller als Platform Admin speichern
    if (companies.isEmpty()) {
      switch (platformAdminPrincipal.value) {
        case null {
          platformAdminPrincipal.value := ?caller;
          platformAdminCreatedAt.value := Time.now();
        };
        case (?_) {};
      };
    };
    // Firma erstellen
    let companyId = nextCompanyId.value;
    nextCompanyId.value += 1;
    let input : CompanyTypes.RegisterCompanyInput = { name; firstName; lastName; email };
    let company = CompanyLib.createCompany(companies, principalToCompany, companyId, input, caller);

    // Admin-Mitarbeiter erstellen
    let employeeId = nextEmployeeId.value;
    nextEmployeeId.value += 1;
    let empInput : CompanyTypes.CreateEmployeeInput = {
      firstName;
      lastName;
      email;
      role = #admin;
      employmentType = #fullTime;
      startDate = "2024-01-01";
      weeklyHoursTarget = 40.0;
      geburtsdatum = null;
      adresseZusatz1 = null;
      adresseZusatz2 = null;
      strasse = null;
      postfach = null;
      plz = null;
      ort = null;
      land = null;
    };
    let emp = CompanyLib.createEmployee(employees, employeeId, companyId, empInput);
    // Principal mit Mitarbeiter verknüpfen
    principalToEmployee.add(caller, employeeId);
    // principalId im Mitarbeiterdatensatz setzen
    employees.mapInPlace(func(e) {
      if (e.id == employeeId) { { e with principalId = ?caller } } else e;
    });

    // Firmeneinstellungen erstellen
    let settings : CompanyTypes.CompanySettings = {
      companyId;
      emailNewVacationRequest = true;
      emailOnApproval = true;
      vacationCarryoverDays = 5;
      maxVacationDays = 20;
      approvalRequired = true;
      timezone = "Europe/Zurich";
      allowExpiredVacationBalance = false;
    };
    companySettings.add(companyId, settings);

    // Auto-Stammdaten erstellen
    // Kunde: Firmenname
    let customerId = nextCustomerId.value;
    nextCustomerId.value += 1;
    ignore MasterLib.createCustomer(customers, customerId, companyId, { name; contact = null; notes = null; beschreibung = null; kundennummer = null; rechnungsadresse = null; zeiterfassungsart = null; waehrung = null; aktiv = null });

    // Dienstleistungsart: interne Administration
    let stId = nextServiceTypeId.value;
    nextServiceTypeId.value += 1;
    ignore MasterLib.createServiceType(serviceTypes, stId, companyId, { name = "interne Administration"; billable = false; defaultRate = 0.0; aktiv = ?true });

    // Projekt: intern / INT
    let projectId = nextProjectId.value;
    nextProjectId.value += 1;
    ignore MasterLib.createProject(projects, projectId, companyId, { customerId; name = "intern"; kurzbezeichnung = "INT"; code = "INT"; billableRate = 0.0; projektleiter = null; status = ?#aktiv; erfassungsart = null; kostendachCHF = null });

    // Spesenart: Spesen allgemein
    let etId = nextExpenseTypeId.value;
    nextExpenseTypeId.value += 1;
    ignore MasterLib.createExpenseType(expenseTypes, etId, companyId, { name = "Spesen allgemein"; billable = true; reimbursable = true; aktiv = ?true });

    // Abwesenheitsarten
    let at1Id = nextAbsenceTypeId.value; nextAbsenceTypeId.value += 1;
    ignore MasterLib.createAbsenceType(absenceTypes, at1Id, companyId, { name = "Krankheit"; requiresApproval = false; compensated = false; aktiv = ?true; visibility = null });
    let at2Id = nextAbsenceTypeId.value; nextAbsenceTypeId.value += 1;
    ignore MasterLib.createAbsenceType(absenceTypes, at2Id, companyId, { name = "Unbezahlter Urlaub"; requiresApproval = false; compensated = false; aktiv = ?true; visibility = null });
    let at3Id = nextAbsenceTypeId.value; nextAbsenceTypeId.value += 1;
    ignore MasterLib.createAbsenceType(absenceTypes, at3Id, companyId, { name = "Sonstiges"; requiresApproval = false; compensated = false; aktiv = ?true; visibility = null });
    let at4Id = nextAbsenceTypeId.value; nextAbsenceTypeId.value += 1;
    ignore MasterLib.createAbsenceType(absenceTypes, at4Id, companyId, { name = "Ferien"; requiresApproval = true; compensated = true; aktiv = ?true; visibility = null });

    // Feiertag: Nationalfeiertag (1. August, 11 Jahre)
    let years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034"];
    for (yr in years.values()) {
      let hId = nextHolidayId.value; nextHolidayId.value += 1;
      ignore MasterLib.createHoliday(holidays, hId, companyId, { name = "Nationalfeiertag"; date = yr # "-08-01"; ganztaegig = ?true });
    };

    // Admin-Mitarbeiter automatisch dem internen Projekt zuweisen (Leistungsart: interne Administration)
    projectMembers.add(projectId, [{ employeeId; serviceTypeId = stId; stundensatz = 0.0; kostendachCHF = null }]);

    // Audit: Firma und erster Admin-Mitarbeiter registrieren
    appendCompanyAudit(caller, companyId, #company, #create, companyId.toText(), null, ?companyToText(company));
    appendCompanyAudit(caller, companyId, #employee, #create, emp.id.toText(), null, ?employeeToText(emp));

    // Default-Pläne initialisieren (nur einmal, unabhängig von der Firma)
    if (not subscriptionPlansInitialized.value) {
      subscriptionPlansInitialized.value := true;
      let _now0 = Time.now();
      if (not subscriptionPlans.containsKey("basis")) {
        let _b : CostDashboardTypes.SubscriptionPlan = {
          id = "basis"; name = "Basis"; description = "Für kleine Teams";
          pricePerMonthCHF = 10.0; pricePerYearCHF = 9.0;
          minActiveDaysPerMonth = 1; maxEmployees = ?2;
          features = ["Dashboard", "Zeiterfassung", "Auswertungen", "Stammdaten", "Kalenderübersicht", "Fakturierung", "Einstellungen"];
          isActive = true; sortOrder = 0; updatedAt = _now0;
          stripeProductId = null; stripePriceId = null; stripePriceIdYearly = null; stripeLookupKey = null;
          paymentProvider = #none; requiresPayment = false; stripeMode = null;
          isRecommended = false; additionalFeatures = ["Basis E-Mail Support"];
        };
        subscriptionPlans.add("basis", _b);
      };
      if (not subscriptionPlans.containsKey("professional")) {
        let _p : CostDashboardTypes.SubscriptionPlan = {
          id = "professional"; name = "Professional"; description = "Für wachsende Unternehmen";
          pricePerMonthCHF = 11.0; pricePerYearCHF = 10.0;
          minActiveDaysPerMonth = 1; maxEmployees = null;
          features = ["Dashboard", "Zeiterfassung", "Auswertungen", "Stammdaten", "Kalenderübersicht", "Fakturierung", "Einstellungen", "Spesenerfassung"];
          isActive = true; sortOrder = 1; updatedAt = _now0;
          stripeProductId = null; stripePriceId = null; stripePriceIdYearly = null; stripeLookupKey = null;
          paymentProvider = #stripe; requiresPayment = true; stripeMode = null;
          isRecommended = true; additionalFeatures = ["Premium E-Mail Support", "Premium Onboarding-Service"];
        };
        subscriptionPlans.add("professional", _p);
      };
    };

    // Abonnement-Zuweisung: übergebenen Plan und Abrechnungsmodell verwenden
    if (not isPlatformAdminCompany_(companyId)) {
      // Nur zuweisen wenn noch kein Plan vorhanden
      let initKey = companyId.toText();
      switch (companySubscriptions.get(initKey)) {
        case null {
          // BillingModel aus billingModel-Parameter ermitteln
          let resolvedBillingModel : CostDashboardTypes.BillingModel = switch (billingModel) {
            case (?bm) {
              if (bm == "yearly") { #yearly } else { #monthly }
            };
            case null { #monthly };
          };
          // Plan-ID validieren: prüfe ob der angegebene Plan in subscriptionPlans vorhanden ist
          let resolvedPlanId : Text = switch (planId) {
            case (?pid) {
              if (pid != "" and subscriptionPlans.containsKey(pid)) {
                pid
              } else {
                // Fallback: ersten aktiven Plan suchen
                let firstActive = subscriptionPlans.values().toArray()
                  .filter(func(p : CostDashboardTypes.SubscriptionPlan) : Bool { p.isActive })
                  .find(func(_ : CostDashboardTypes.SubscriptionPlan) : Bool { true });
                switch (firstActive) {
                  case (?p) { p.id };
                  case null { "basis" }; // letzter Fallback
                };
              }
            };
            case null {
              // Fallback: ersten aktiven Plan suchen
              let firstActive = subscriptionPlans.values().toArray()
                .filter(func(p : CostDashboardTypes.SubscriptionPlan) : Bool { p.isActive })
                .find(func(_ : CostDashboardTypes.SubscriptionPlan) : Bool { true });
              switch (firstActive) {
                case (?p) { p.id };
                case null { "basis" }; // letzter Fallback
              };
            };
          };
          let initNow = Time.now();
          companySubscriptions.add(initKey, resolvedPlanId);
          companySubscriptionDetails.add(initKey, {
            companyId;
            planId                       = resolvedPlanId;
            billingModel                 = resolvedBillingModel;
            subscriptionStartDate        = ?initNow;
            proRataAmount                = null;
            proRataNote                  = null;
            proRataCalculatedAt          = null;
            nextDueDate                  = null;
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
        };
        case (?_) {};
      };
    };

    // Willkommens-E-Mail an den Admin senden (fire-and-forget)
    ignore await EmailClient.sendServiceEmail(
      "no-reply",
      [email, "info@ireport.ch"],
      "Willkommen bei iReport Onchain",
      "<p>Hallo " # firstName # " " # lastName # "</p>" #
      "<p>Herzlich willkommen bei <strong>iReport Onchain</strong>! Deine Firma <strong>" # name # "</strong> wurde erfolgreich registriert.</p>" #
      "<p>Du kannst dich jetzt in deinem Dashboard anmelden und loslegen.</p>" #
      "<p>Bei Fragen stehen wir dir jederzeit gerne zur Verfügung.</p>" #
      "<p>Herzliche Grüsse<br/>Dein iReport Onchain Team</p>",
    );

    #ok(company);
  };

  // Gibt die Firma des Aufrufers zurück
  public query ({ caller }) func getMyCompany() : async CommonTypes.Result<CompanyTypes.Company> {
    switch (CompanyLib.getCompanyByPrincipal(companies, principalToCompany, caller)) {
      case null { #err("Nicht authentifiziert") };
      case (?c) { #ok(c) };
    };
  };

  // Aktualisiert die Firmendaten
  public shared ({ caller }) func updateCompany(
    input : CompanyTypes.UpdateCompanyInput
  ) : async CommonTypes.Result<CompanyTypes.Company> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin]);
    let beforeOpt = companies.find(func(c : CompanyTypes.Company) : Bool = c.id == companyId);
    switch (CompanyLib.updateCompany(companies, companyId, input)) {
      case null { #err("Firma nicht gefunden") };
      case (?c) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?companyToText(b) } };
        // Feldänderungen ermitteln
        let changes : ?[AuditTypes.AuditFieldChange] = switch (beforeOpt) {
          case null { null };
          case (?b) {
            var list : [AuditTypes.AuditFieldChange] = [];
            if (b.name != c.name) {
              list := list.concat([{ fieldName = "name"; before = b.name; after = c.name }]);
            };
            if (list.size() > 0) { ?list } else { null };
          };
        };
        appendCompanyAuditWithChanges(caller, companyId, #company, #update, companyId.toText(), beforeText, ?companyToText(c), changes);
        #ok(c);
      };
    };
  };

  // Gibt den eigenen Mitarbeiterdatensatz zurück
  public query ({ caller }) func getMyEmployee() : async CommonTypes.Result<CompanyTypes.Employee> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    switch (CompanyLib.getEmployeeByPrincipal(employees, principalToEmployee, caller, companyId)) {
      case null { #err("Mitarbeiter nicht gefunden") };
      case (?e) { #ok(e) };
    };
  };

  // Gibt alle Mitarbeiter der Firma zurück
  public query ({ caller }) func listEmployees() : async [CompanyTypes.Employee] {
    let companyId = requireCompanyId(caller);
    CompanyLib.listEmployees(employees, companyId);
  };

  // Erstellt einen neuen Mitarbeiter (Admin/Manager)
  public shared ({ caller }) func createEmployee(
    input : CompanyTypes.CreateEmployeeInput
  ) : async CommonTypes.Result<CompanyTypes.Employee> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin, #manager]);
    let id = nextEmployeeId.value;
    nextEmployeeId.value += 1;
    let emp = CompanyLib.createEmployee(employees, id, companyId, input);

    // Best-effort: Mitarbeiter automatisch dem internen Projekt (INT) zuweisen
    // mit Leistungsart "interne Administration"
    let internalProject = projects.find(func(p) {
      p.companyId == companyId and (p.kurzbezeichnung == "INT" or p.code == "INT")
    });
    switch (internalProject) {
      case null { /* kein internes Projekt gefunden – ignorieren */ };
      case (?proj) {
        let internalSt = serviceTypes.find(func(s) {
          s.companyId == companyId and s.name == "interne Administration"
        });
        switch (internalSt) {
          case null { /* keine passende Leistungsart – ignorieren */ };
          case (?st) {
            // Bestehende Mitglieder lesen und neues Mitglied anhängen
            let currentMembers : [MasterTypes.ProjectMemberAssignment] = switch (projectMembers.get(proj.id)) {
              case (?m) m;
              case null [];
            };
            // Prüfen ob bereits zugewiesen
            let alreadyAssigned = currentMembers.any(func(m) { m.employeeId == emp.id });
            if (not alreadyAssigned) {
              let newMember : MasterTypes.ProjectMemberAssignment = {
                employeeId = emp.id;
                serviceTypeId = st.id;
                stundensatz = 0.0;
                kostendachCHF = null;
              };
              let updatedMembers = currentMembers.concat([newMember]);
              projectMembers.add(proj.id, updatedMembers);
            };
          };
        };
      };
    };

    appendCompanyAudit(caller, companyId, #employee, #create, emp.id.toText(), null, ?employeeToText(emp));

    // Auto-Initialisierung: Standard-Compliance-Profil fuer neuen Mitarbeiter erstellen
    // aktiv = true: sofort aktiv, damit der wöchentliche Compliance-Check greift.
    // vertraglicheWochenstunden wird NICHT gespeichert – wird aus der Beschäftigung gelesen.
    let _cpNow = Time.now();
    let _cpId = nextComplianceProfileId.value;
    nextComplianceProfileId.value += 1;
    let _defaultProfile : ComplianceTypes.EmployeeComplianceProfile = {
      id = _cpId;
      employeeId = emp.id;
      companyId;
      aktiv = true;
      gesetzlicheWochenhochstarbeitszeit = 45.0;
      gesetzlicherFerienanspruchWochen = 4.0;
      vertraglicheZusatzferienTage = 0.0;
      ausnahmeprofil = null;
      erfassungsModus = "VOLLSTAENDIG";
      createdAt = _cpNow;
      updatedAt = _cpNow;
    };
    complianceProfiles.add(_defaultProfile);
    #ok(emp);
  };

  // Aktualisiert einen Mitarbeiter (Admin/Manager)
  // FIX: Status-Toggle für alle Rollen zuverlässig implementiert.
  // requireRole prüft NUR die Rolle des Aufrufers (caller), nicht des Zielobjekts.
  public shared ({ caller }) func updateEmployee(
    id : CommonTypes.EmployeeId,
    input : CompanyTypes.UpdateEmployeeInput,
  ) : async CommonTypes.Result<CompanyTypes.Employee> {
    let companyId = requireCompanyId(caller);
    // Zugriffscheck: gibt #err zurück statt zu trappen, damit Frontend die Meldung sieht
    let company = switch (companies.find(func(c : CompanyTypes.Company) : Bool = c.id == companyId)) {
      case null { return #err("Firma nicht gefunden") };
      case (?c) c;
    };
    switch (AccessControlLib.requireRole(caller, company, [#admin, #manager], principalToEmployee, employees)) {
      case (#err(_)) { return #err("Keine Berechtigung: nur Admin oder Manager") };
      case (#ok(_)) {};
    };
    let beforeOpt = employees.find(func(e) { e.id == id and e.companyId == companyId });
    switch (CompanyLib.updateEmployee(employees, companyId, id, input)) {
      case null { #err("Mitarbeiter nicht gefunden oder gehört nicht zu deiner Firma") };
      case (?e) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?employeeToText(b) } };
        // Strukturierte Feldänderungen ermitteln
        let changes : ?[AuditTypes.AuditFieldChange] = switch (beforeOpt) {
          case null { null };
          case (?b) {
            var list : [AuditTypes.AuditFieldChange] = [];
            if (b.active != e.active) {
              list := list.concat([{ fieldName = "active"; before = if (b.active) "true" else "false"; after = if (e.active) "true" else "false" }]);
            };
            if (b.role != e.role) {
              let roleText = func(r : CompanyTypes.Role) : Text = switch (r) { case (#admin) "admin"; case (#manager) "manager"; case (#employee) "employee" };
              list := list.concat([{ fieldName = "role"; before = roleText(b.role); after = roleText(e.role) }]);
            };
            if (b.firstName != e.firstName) {
              list := list.concat([{ fieldName = "firstName"; before = b.firstName; after = e.firstName }]);
            };
            if (b.lastName != e.lastName) {
              list := list.concat([{ fieldName = "lastName"; before = b.lastName; after = e.lastName }]);
            };
            if (b.email != e.email) {
              list := list.concat([{ fieldName = "email"; before = b.email; after = e.email }]);
            };
            if (list.size() > 0) { ?list } else { null };
          };
        };
        appendCompanyAuditWithChanges(caller, companyId, #employee, #update, e.id.toText(), beforeText, ?employeeToText(e), changes);
        #ok(e);
      };
    };
  };

  // Setzt den Aktiv-Status eines Mitarbeiters direkt (Admin/Manager).
  // Dedizierter Endpunkt mit non-optionalem Bool, um das ?Bool-Candid-Encoding-Problem zu umgehen
  // (value.active ? some(v) : none() gibt bei false fälschlicherweise none() zurück).
  public shared ({ caller }) func setEmployeeActive(
    id : CommonTypes.EmployeeId,
    active : Bool,
  ) : async CommonTypes.Result<CompanyTypes.Employee> {
    let companyId = requireCompanyId(caller);
    let company = switch (companies.find(func(c : CompanyTypes.Company) : Bool = c.id == companyId)) {
      case null { return #err("Firma nicht gefunden") };
      case (?c) c;
    };
    switch (AccessControlLib.requireRole(caller, company, [#admin, #manager], principalToEmployee, employees)) {
      case (#err(_)) { return #err("Keine Berechtigung: nur Admin oder Manager") };
      case (#ok(_)) {};
    };
    let beforeOpt = employees.find(func(e) { e.id == id and e.companyId == companyId });
    switch (CompanyLib.updateEmployee(employees, companyId, id, { active = ?active; firstName = null; lastName = null; email = null; role = null; employmentType = null; startDate = null; weeklyHoursTarget = null; geburtsdatum = null; adresseZusatz1 = null; adresseZusatz2 = null; strasse = null; postfach = null; plz = null; ort = null; land = null })) {
      case null { #err("Mitarbeiter nicht gefunden oder gehört nicht zu deiner Firma") };
      case (?e) {
        let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?employeeToText(b) } };
        let changes : ?[AuditTypes.AuditFieldChange] = switch (beforeOpt) {
          case null { null };
          case (?b) {
            if (b.active != e.active) {
              ?[{ fieldName = "active"; before = if (b.active) "true" else "false"; after = if (e.active) "true" else "false" }]
            } else { null };
          };
        };
        appendCompanyAuditWithChanges(caller, companyId, #employee, #update, e.id.toText(), beforeText, ?employeeToText(e), changes);
        // Plan-Auto-Zuweisung bei Statusaenderung ENTFERNT:
        // Planwechsel erfolgt nur nach expliziter Benutzer-Bestätigung via applyPlanChange().
        #ok(e);
      };
    };
  };

  // Deaktiviert einen Mitarbeiter (setzt active=false) – Admin
  public shared ({ caller }) func deleteEmployee(
    id : CommonTypes.EmployeeId
  ) : async CommonTypes.Result<()> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin]);
    let beforeOpt = employees.find(func(e) { e.id == id and e.companyId == companyId });
    if (CompanyLib.deleteEmployee(employees, companyId, id)) {
      // Capture afterState: employee is now deactivated (active=false, deactivatedAt set)
      let afterOpt = employees.find(func(e) { e.id == id and e.companyId == companyId });
      let beforeText = switch (beforeOpt) { case null { null }; case (?b) { ?employeeToText(b) } };
      let afterText = switch (afterOpt) { case null { null }; case (?a) { ?employeeToText(a) } };
      let changes : ?[AuditTypes.AuditFieldChange] = switch (beforeOpt) {
        case null { null };
        case (?b) {
          ?[{ fieldName = "active"; before = "true"; after = "false" }]
        };
      };
      appendCompanyAuditWithChanges(caller, companyId, #employee, #update, id.toText(), beforeText, afterText, changes);
      #ok(());
    } else {
      #err("Mitarbeiter nicht gefunden");
    };
  };

  // Löscht einen Mitarbeiter dauerhaft (Admin) – nur wenn keine Daten vorhanden
  // Prüft: Zeiterfassungen, Ferieneinträge/Abwesenheiten, Spesen
  public shared ({ caller }) func purgeEmployee(
    id : CommonTypes.EmployeeId
  ) : async CommonTypes.Result<()> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin]);
    // Mitarbeiter muss zur Firma gehören
    let empOpt = employees.find(func(e) { e.id == id and e.companyId == companyId });
    switch (empOpt) {
      case null { return #err("Mitarbeiter nicht gefunden oder gehört nicht zu deiner Firma") };
      case (?_) {};
    };
    // Vorprüfung: Zeiterfassungen
    let hasTimeEntries = timeEntries.any(func(te : TrackingTypes.TimeEntry) : Bool {
      te.employeeId == id and te.companyId == companyId
    });
    if (hasTimeEntries) {
      return #err("Dieser Mitarbeiter kann nicht gelöscht werden, da noch Zeiterfassungen vorhanden sind.");
    };
    // Vorprüfung: Abwesenheiten/Ferien
    let hasAbsences = absences.any(func(ab : TrackingTypes.Absence) : Bool {
      ab.employeeId == id and ab.companyId == companyId
    });
    if (hasAbsences) {
      return #err("Dieser Mitarbeiter kann nicht gelöscht werden, da noch Ferieneinträge/Abwesenheiten vorhanden sind.");
    };
    // Vorprüfung: Spesen
    let hasExpenses = expenses.any(func(ex : TrackingTypes.Expense) : Bool {
      ex.employeeId == id and ex.companyId == companyId
    });
    if (hasExpenses) {
      return #err("Dieser Mitarbeiter kann nicht gelöscht werden, da noch Spesen vorhanden sind.");
    };
    // KRITISCH: beforeState VOR dem Löschen serialisieren
    let beforeText : ?Text = switch (empOpt) {
      case null { null };
      case (?e) { ?employeeToText(e) };
    };
    // Echtes Löschen: Mitarbeiterdatensatz
    let empFiltered = employees.filter(func(e) { not (e.id == id and e.companyId == companyId) });
    employees.clear();
    employees.append(empFiltered);
    // Beschäftigungen entfernen
    let emFiltered = employments.filter(func(em : CompanyTypes.Employment) : Bool {
      not (em.employeeId == id and em.companyId == companyId)
    });
    employments.clear();
    employments.append(emFiltered);
    // Ferienguthaben entfernen
    let vbFiltered = vacationBalances.filter(func(vb : CompanyTypes.VacationBalance) : Bool {
      not (vb.employeeId == id and vb.companyId == companyId)
    });
    vacationBalances.clear();
    vacationBalances.append(vbFiltered);
    // Zeitsaldokorrekturen entfernen
    let tbFiltered = timeBalanceCorrections.filter(func(c : CompanyTypes.TimeBalanceCorrection) : Bool {
      not (c.employeeId == id and c.companyId == companyId)
    });
    timeBalanceCorrections.clear();
    timeBalanceCorrections.append(tbFiltered);
    // Principal-Mapping entfernen (falls vorhanden)
    let principalsToRemove : [Principal] = principalToEmployee.entries()
      .toArray()
      .filterMap<(Principal, CommonTypes.EmployeeId), Principal>(func((p, empId)) {
        if (empId == id) { ?p } else { null }
      });
    for (p in principalsToRemove.values()) {
      principalToEmployee.remove(p);
      principalToCompany.remove(p);
    };
    // Audit: #remove mit beforeState (serialisiert VOR dem Löschen), afterState=null
    appendCompanyAudit(caller, companyId, #employee, #remove, id.toText(), beforeText, null);
    #ok(());
  };

  // Gibt die Firmeneinstellungen zurück
  public query ({ caller }) func getCompanySettings() : async CommonTypes.Result<CompanyTypes.CompanySettings> {
    let companyId = requireCompanyId(caller);
    #ok(CompanyLib.getCompanySettings(companySettings, companyId));
  };

  // Aktualisiert die Firmeneinstellungen (Admin)
  public shared ({ caller }) func updateCompanySettings(
    input : CompanyTypes.CompanySettings
  ) : async CommonTypes.Result<CompanyTypes.CompanySettings> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin]);
    #ok(CompanyLib.updateCompanySettings(companySettings, companyId, input));
  };

  // Gibt die Benachrichtigungseinstellungen des Aufrufers zurück
  public query ({ caller }) func getUserNotificationSettings() : async CommonTypes.Result<CompanyTypes.UserNotificationSettings> {
    let companyId = requireCompanyId(caller);
    #ok(CompanyLib.getUserNotificationSettings(userNotifSettings, caller, companyId));
  };

  // Aktualisiert die Benachrichtigungseinstellungen des Aufrufers
  public shared ({ caller }) func updateUserNotificationSettings(
    input : CompanyTypes.UserNotificationSettings
  ) : async CommonTypes.Result<CompanyTypes.UserNotificationSettings> {
    ignore requireCompanyId(caller);
    #ok(CompanyLib.updateUserNotificationSettings(userNotifSettings, caller, input));
  };

  // ─── Beschäftigungen ────────────────────────────────────────────────────────

  // Listet alle Beschäftigungen eines Mitarbeiters
  public query ({ caller }) func listEmployments(
    employeeId : CommonTypes.EmployeeId
  ) : async CommonTypes.Result<[CompanyTypes.Employment]> {
    let companyId = requireCompanyId(caller);
    #ok(CompanyLib.listEmployments(employments, companyId, employeeId));
  };

  // Erstellt eine neue Beschäftigung (Admin/Manager)
  public shared ({ caller }) func createEmployment(
    employeeId : CommonTypes.EmployeeId,
    input : CompanyTypes.CreateEmploymentInput,
  ) : async CommonTypes.Result<CompanyTypes.Employment> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin, #manager]);
    // Pensum validieren (0–100): Float → Nat-Konvertierung für den Validator
    switch (InputValidator.isValidPensum(input.pensum.toInt().toNat())) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(())) {};
    };
    let id = nextEmploymentId.value;
    nextEmploymentId.value += 1;
    switch (CompanyLib.createEmployment(employments, id.toText(), employeeId, companyId, input)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(em)) { #ok(em) };
    };
  };

  // Aktualisiert eine Beschäftigung (Admin/Manager)
  public shared ({ caller }) func updateEmployment(
    employeeId : CommonTypes.EmployeeId,
    employmentId : Text,
    input : CompanyTypes.UpdateEmploymentInput,
  ) : async CommonTypes.Result<CompanyTypes.Employment> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin, #manager]);
    // Pensum validieren (0–100): Float → Nat-Konvertierung für den Validator
    switch (InputValidator.isValidPensum(input.pensum.toInt().toNat())) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(())) {};
    };
    switch (CompanyLib.updateEmployment(employments, companyId, employeeId, employmentId, input)) {
      case (#err(msg)) { #err(msg) };
      case (#ok(em)) { #ok(em) };
    };
  };

  // Löscht eine Beschäftigung (Admin)
  public shared ({ caller }) func deleteEmployment(
    employeeId : CommonTypes.EmployeeId,
    employmentId : Text,
  ) : async CommonTypes.Result<()> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin]);
    if (CompanyLib.deleteEmployment(employments, companyId, employeeId, employmentId)) {
      #ok(());
    } else {
      #err("Beschäftigung nicht gefunden");
    };
  };

  // Gibt die aktive Beschäftigung für einen Mitarbeiter zu einem bestimmten Datum zurück
  // date: Text im Format "YYYY-MM-DD"
  // Nützlich für die Frontend-Vorschau der Ganztätig-Stunden bei Ferienerfassung
  public query ({ caller }) func getEmploymentForDate(
    employeeId : CommonTypes.EmployeeId,
    date : Text,
  ) : async CommonTypes.Result<?CompanyTypes.Employment> {
    let companyId = requireCompanyId(caller);
    let dayNs = CompanyLib.dateTextToNs(date);
    #ok(CompanyLib.activeEmploymentForDay(employments, employeeId, companyId, dayNs));
  };

  // ─── Ferienguthaben ──────────────────────────────────────────────────────────

  // Listet alle Ferienguthaben eines Mitarbeiters
  public query ({ caller }) func listVacationBalances(
    employeeId : CommonTypes.EmployeeId
  ) : async CommonTypes.Result<[CompanyTypes.VacationBalance]> {
    let companyId = requireCompanyId(caller);
    #ok(CompanyLib.listVacationBalances(vacationBalances, companyId, employeeId));
  };

  // Erstellt ein Ferienguthaben (Admin/Manager)
  public shared ({ caller }) func createVacationBalance(
    employeeId : CommonTypes.EmployeeId,
    input : CompanyTypes.CreateVacationBalanceInput,
  ) : async CommonTypes.Result<CompanyTypes.VacationBalance> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin, #manager]);
    let id = nextVacationBalanceId.value;
    nextVacationBalanceId.value += 1;
    #ok(CompanyLib.createVacationBalance(vacationBalances, id.toText(), employeeId, companyId, input));
  };

  // Aktualisiert ein Ferienguthaben (Admin/Manager)
  public shared ({ caller }) func updateVacationBalance(
    employeeId : CommonTypes.EmployeeId,
    balanceId : Text,
    input : CompanyTypes.UpdateVacationBalanceInput,
  ) : async CommonTypes.Result<CompanyTypes.VacationBalance> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin, #manager]);
    switch (CompanyLib.updateVacationBalance(vacationBalances, companyId, employeeId, balanceId, input)) {
      case null { #err("Ferienguthaben nicht gefunden") };
      case (?vb) { #ok(vb) };
    };
  };

  // Löscht ein Ferienguthaben (Admin)
  public shared ({ caller }) func deleteVacationBalance(
    employeeId : CommonTypes.EmployeeId,
    balanceId : Text,
  ) : async CommonTypes.Result<()> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin]);
    if (CompanyLib.deleteVacationBalance(vacationBalances, companyId, employeeId, balanceId)) {
      #ok(());
    } else {
      #err("Ferienguthaben nicht gefunden");
    };
  };

  // ─── Standard-Arbeitsstunden ──────────────────────────────────────────────────

  // Gibt die Standard-Arbeitsstunden der Firma zurueck (oder Standardwerte 480/0)
  public query ({ caller }) func getDefaultWorkHours() : async CompanyTypes.DefaultWorkHours {
    let companyId = requireCompanyId(caller);
    switch (defaultWorkHoursMap.get(companyId)) {
      case (?dwh) { dwh };
      case null {
        {
          companyId;
          stundenMo = 480;
          stundenDi = 480;
          stundenMi = 480;
          stundenDo = 480;
          stundenFr = 480;
          stundenSa = 0;
          stundenSo = 0;
        };
      };
    };
  };

  // Aktualisiert die Standard-Arbeitsstunden der Firma (Admin)
  public shared ({ caller }) func updateDefaultWorkHours(
    input : CompanyTypes.DefaultWorkHours
  ) : async CommonTypes.Result<CompanyTypes.DefaultWorkHours> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin]);
    let updated : CompanyTypes.DefaultWorkHours = { input with companyId };
    defaultWorkHoursMap.add(companyId, updated);
    #ok(updated);
  };

  // ─── Zeitsaldokorrekturen ────────────────────────────────────────────────────

  // Listet alle Zeitsaldokorrekturen eines Mitarbeiters
  public query ({ caller }) func listTimeBalanceCorrections(
    employeeId : CommonTypes.EmployeeId
  ) : async CommonTypes.Result<[CompanyTypes.TimeBalanceCorrection]> {
    let companyId = requireCompanyId(caller);
    #ok(CompanyLib.listTimeBalanceCorrections(timeBalanceCorrections, companyId, employeeId));
  };

  // Erstellt eine Zeitsaldokorrektur (Admin/Manager)
  public shared ({ caller }) func createTimeBalanceCorrection(
    employeeId : CommonTypes.EmployeeId,
    input : CompanyTypes.CreateTimeBalanceCorrectionInput,
  ) : async CommonTypes.Result<CompanyTypes.TimeBalanceCorrection> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin, #manager]);
    let id = nextTimeCorrectionId.value;
    nextTimeCorrectionId.value += 1;
    #ok(CompanyLib.createTimeBalanceCorrection(timeBalanceCorrections, id.toText(), employeeId, companyId, input));
  };

  // Aktualisiert eine Zeitsaldokorrektur (Admin/Manager)
  public shared ({ caller }) func updateTimeBalanceCorrection(
    employeeId : CommonTypes.EmployeeId,
    correctionId : Text,
    input : CompanyTypes.UpdateTimeBalanceCorrectionInput,
  ) : async CommonTypes.Result<CompanyTypes.TimeBalanceCorrection> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin, #manager]);
    switch (CompanyLib.updateTimeBalanceCorrection(timeBalanceCorrections, companyId, employeeId, correctionId, input)) {
      case null { #err("Zeitsaldokorrektur nicht gefunden") };
      case (?c) { #ok(c) };
    };
  };

  // Löscht eine Zeitsaldokorrektur (Admin)
  public shared ({ caller }) func deleteTimeBalanceCorrection(
    employeeId : CommonTypes.EmployeeId,
    correctionId : Text,
  ) : async CommonTypes.Result<()> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin]);
    if (CompanyLib.deleteTimeBalanceCorrection(timeBalanceCorrections, companyId, employeeId, correctionId)) {
      #ok(());
    } else {
      #err("Zeitsaldokorrektur nicht gefunden");
    };
  };

  // Gibt den Gleitzeitkonto-Saldo zurück (Summe aller Korrekturen in Minuten)
  public query ({ caller }) func getTimeBalance(
    employeeId : CommonTypes.EmployeeId
  ) : async CommonTypes.Result<Int> {
    let companyId = requireCompanyId(caller);
    #ok(CompanyLib.getTimeBalance(timeBalanceCorrections, companyId, employeeId));
  };

  // ─── Arbeitszeitsaldo ────────────────────────────────────────────────────────

  // Berechnet den vollständigen Arbeitszeitsaldo für einen Mitarbeiter im Zeitraum
  // Zugriffssteuerung: Mitarbeiter kann nur eigenen Saldo abfragen; Admin/Manager alle
  public query ({ caller }) func getEmployeeWorkTimeBalance(
    employeeId : CommonTypes.EmployeeId,
    startDate : Text,
    endDate : Text,
  ) : async CommonTypes.Result<CompanyTypes.WorkTimeBalance> {
    let companyId = requireCompanyId(caller);
    // Zugriffssteuerung
    let callerEmpId = switch (principalToEmployee.get(caller)) {
      case null { return #err("Kein Mitarbeiterdatensatz gefunden") };
      case (?eid) eid;
    };
    let callerEmp = switch (employees.find(func(e) { e.id == callerEmpId and e.companyId == companyId })) {
      case null { return #err("Mitarbeiter nicht gefunden") };
      case (?e) e;
    };
    let isAdminOrManager = callerEmp.role == #admin or callerEmp.role == #manager;
    if (not isAdminOrManager and callerEmpId != employeeId) {
      return #err("Keine Berechtigung für diese Aktion");
    };
    #ok(CompanyLib.getWorkTimeBalance(
      employments,
      timeBalanceCorrections,
      timeEntries,
      absences,
      absenceTypes,
      holidays,
      employeeId,
      companyId,
      startDate,
      endDate,
    ));
  };

  // Berechnet Arbeitszeitsaldo ab Beginn der ersten Beschäftigung bis heute
  public query ({ caller }) func getEmployeeWorkTimeBalanceFromStart(
    employeeId : CommonTypes.EmployeeId
  ) : async CommonTypes.Result<CompanyTypes.WorkTimeBalance> {
    let companyId = requireCompanyId(caller);
    // Zugriffssteuerung
    let callerEmpId = switch (principalToEmployee.get(caller)) {
      case null { return #err("Kein Mitarbeiterdatensatz gefunden") };
      case (?eid) eid;
    };
    let callerEmp = switch (employees.find(func(e) { e.id == callerEmpId and e.companyId == companyId })) {
      case null { return #err("Mitarbeiter nicht gefunden") };
      case (?e) e;
    };
    let isAdminOrManager = callerEmp.role == #admin or callerEmp.role == #manager;
    if (not isAdminOrManager and callerEmpId != employeeId) {
      return #err("Keine Berechtigung für diese Aktion");
    };
    switch (CompanyLib.getWorkTimeBalanceFromStart(
      employments,
      timeBalanceCorrections,
      timeEntries,
      absences,
      absenceTypes,
      holidays,
      employeeId,
      companyId,
    )) {
      case (#err(msg)) { #err(msg) };
      case (#ok(bal)) { #ok(bal) };
    };
  };
};
