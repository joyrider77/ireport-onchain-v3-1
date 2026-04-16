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
import MasterLib "../lib/masterdata";
import CompanyLib "../lib/company";

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
) {
  // Hilfsfunktion: Authentifizierung prüfen
  private func requireCompanyId(caller : Principal) : CommonTypes.CompanyId {
    switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
  };

  // Hilfsfunktion: Employee-ID des Aufrufers ermitteln
  private func requireEmployeeId(caller : Principal) : CommonTypes.EmployeeId {
    switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Kein Mitarbeiterdatensatz gefunden") };
      case (?eid) eid;
    };
  };

  // Hilfsfunktion: Rolle des Aufrufers prüfen
  private func requireRole(caller : Principal, companyId : CommonTypes.CompanyId, allowedRoles : [CommonTypes.Role]) : () {
    let empId = requireEmployeeId(caller);
    let emp = switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
      case null { Runtime.trap("Mitarbeiter nicht gefunden") };
      case (?e) e;
    };
    let hasRole = allowedRoles.any(func(r) { r == emp.role });
    if (not hasRole) {
      Runtime.trap("Keine Berechtigung für diese Aktion");
    };
  };

  // Prüft ob der Aufrufer bereits registriert ist
  public query ({ caller }) func isRegistered() : async Bool {
    CompanyLib.isRegistered(principalToCompany, caller);
  };

  // Registriert eine neue Firma und den ersten Admin-Benutzer
  public shared ({ caller }) func registerCompany(
    name : Text,
    firstName : Text,
    lastName : Text,
    email : Text,
  ) : async CommonTypes.Result<CompanyTypes.Company> {
    if (CompanyLib.isRegistered(principalToCompany, caller)) {
      return #err("Diese Identität ist bereits registriert");
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
    ignore MasterLib.createProject(projects, projectId, companyId, { customerId; name = "intern"; kurzbezeichnung = "INT"; code = "INT"; billableRate = 0.0; projektleiter = null; status = ?#aktiv; erfassungsart = null });

    // Spesenart: Spesen allgemein
    let etId = nextExpenseTypeId.value;
    nextExpenseTypeId.value += 1;
    ignore MasterLib.createExpenseType(expenseTypes, etId, companyId, { name = "Spesen allgemein"; billable = true; reimbursable = true; aktiv = ?true });

    // Abwesenheitsarten
    let at1Id = nextAbsenceTypeId.value; nextAbsenceTypeId.value += 1;
    ignore MasterLib.createAbsenceType(absenceTypes, at1Id, companyId, { name = "Krankheit"; requiresApproval = false; compensated = false; aktiv = ?true });
    let at2Id = nextAbsenceTypeId.value; nextAbsenceTypeId.value += 1;
    ignore MasterLib.createAbsenceType(absenceTypes, at2Id, companyId, { name = "Unbezahlter Urlaub"; requiresApproval = false; compensated = false; aktiv = ?true });
    let at3Id = nextAbsenceTypeId.value; nextAbsenceTypeId.value += 1;
    ignore MasterLib.createAbsenceType(absenceTypes, at3Id, companyId, { name = "Sonstiges"; requiresApproval = false; compensated = false; aktiv = ?true });
    let at4Id = nextAbsenceTypeId.value; nextAbsenceTypeId.value += 1;
    ignore MasterLib.createAbsenceType(absenceTypes, at4Id, companyId, { name = "Ferien"; requiresApproval = true; compensated = true; aktiv = ?true });

    // Feiertag: Nationalfeiertag (1. August, 11 Jahre)
    let years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034"];
    for (yr in years.values()) {
      let hId = nextHolidayId.value; nextHolidayId.value += 1;
      ignore MasterLib.createHoliday(holidays, hId, companyId, { name = "Nationalfeiertag"; date = yr # "-08-01"; ganztaegig = ?true });
    };

    // Admin-Mitarbeiter automatisch dem internen Projekt zuweisen (Leistungsart: interne Administration)
    projectMembers.add(projectId, [{ employeeId; serviceTypeId = stId; stundensatz = 0.0 }]);

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
    switch (CompanyLib.updateCompany(companies, companyId, input)) {
      case null { #err("Firma nicht gefunden") };
      case (?c) { #ok(c) };
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
              };
              let updatedMembers = currentMembers.concat([newMember]);
              projectMembers.add(proj.id, updatedMembers);
            };
          };
        };
      };
    };

    #ok(emp);
  };

  // Aktualisiert einen Mitarbeiter (Admin/Manager)
  public shared ({ caller }) func updateEmployee(
    id : CommonTypes.EmployeeId,
    input : CompanyTypes.UpdateEmployeeInput,
  ) : async CommonTypes.Result<CompanyTypes.Employee> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin, #manager]);
    switch (CompanyLib.updateEmployee(employees, companyId, id, input)) {
      case null { #err("Mitarbeiter nicht gefunden") };
      case (?e) { #ok(e) };
    };
  };

  // Löscht einen Mitarbeiter (Admin)
  public shared ({ caller }) func deleteEmployee(
    id : CommonTypes.EmployeeId
  ) : async CommonTypes.Result<()> {
    let companyId = requireCompanyId(caller);
    requireRole(caller, companyId, [#admin]);
    if (CompanyLib.deleteEmployee(employees, companyId, id)) {
      #ok(());
    } else {
      #err("Mitarbeiter nicht gefunden");
    };
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
