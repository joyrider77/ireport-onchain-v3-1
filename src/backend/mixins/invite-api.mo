// Öffentliche API für das Einladungssystem (Mitarbeiter-Onboarding)
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import InviteLinksModule "mo:caffeineai-invite-links/invite-links-module";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import CompanyLib "../lib/company";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  inviteState : InviteLinksModule.InviteLinksSystemState,
  inviteToEmployee : Map.Map<Text, CommonTypes.InviteEntry>,
) {
  // 48 Stunden in Nanosekunden
  let INVITE_TTL_NS : Int = 48 * 60 * 60 * 1_000_000_000;
  // Maximale Anzahl aktiver Codes pro Firma
  let MAX_ACTIVE_CODES : Nat = 10;

  // Hilfsfunktion: Admin/Manager-Rolle prüfen
  private func invRequireAdminOrManager(caller : Principal, companyId : CommonTypes.CompanyId) : () {
    let empId = switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Mitarbeiter nicht gefunden") };
      case (?eid) eid;
    };
    let emp = switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
      case null { Runtime.trap("Mitarbeiter nicht gefunden") };
      case (?e) e;
    };
    if (emp.role != #admin and emp.role != #manager) {
      Runtime.trap("Keine Berechtigung: Nur Admin oder Manager");
    };
  };

  // Bereinigt abgelaufene Einladungscodes einer bestimmten Firma.
  // Muss aufgerufen werden bevor das Limit geprüft wird.
  private func purgeExpiredCodes(companyId : CommonTypes.CompanyId) : () {
    let now = Time.now();
    // Sammle abgelaufene Codes dieser Firma
    let toRemove = List.empty<Text>();
    for ((code, entry) in inviteToEmployee.entries()) {
      if (entry.expiresAt < now) {
        // Prüfen ob dieser Code zur Firma gehört
        switch (employees.find(func(e) { e.id == entry.employeeId and e.companyId == companyId })) {
          case (?_) { toRemove.add(code) };
          case null {};
        };
      };
    };
    for (code in toRemove.values()) {
      inviteToEmployee.remove(code);
    };
  };

  // Zählt aktive (nicht abgelaufene) Codes für eine Firma
  private func countActiveCodes(companyId : CommonTypes.CompanyId) : Nat {
    let now = Time.now();
    var count : Nat = 0;
    for ((_, entry) in inviteToEmployee.entries()) {
      if (entry.expiresAt >= now) {
        switch (employees.find(func(e) { e.id == entry.employeeId and e.companyId == companyId })) {
          case (?_) { count += 1 };
          case null {};
        };
      };
    };
    count;
  };

  // Generiert einen Einladungscode für einen Mitarbeiter (Admin/Manager)
  public shared ({ caller }) func generateInviteCode(
    employeeId : CommonTypes.EmployeeId
  ) : async CommonTypes.Result<Text> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    invRequireAdminOrManager(caller, companyId);

    // 1. Abgelaufene Codes dieser Firma bereinigen
    purgeExpiredCodes(companyId);

    // 2. Limit prüfen
    if (countActiveCodes(companyId) >= MAX_ACTIVE_CODES) {
      return #err("Too many active invite codes");
    };

    // 3. Prüfen ob Mitarbeiter zur Firma gehört
    let emp = switch (employees.find(func(e) { e.id == employeeId and e.companyId == companyId })) {
      case null { return #err("Mitarbeiter nicht gefunden") };
      case (?e) e;
    };
    // 4. Prüfen ob Mitarbeiter bereits einen Principal hat
    if (emp.principalId != null) {
      return #err("Mitarbeiter ist bereits registriert");
    };

    // 5. Code generieren und mit Ablaufdatum speichern
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    let entry : CommonTypes.InviteEntry = {
      employeeId = employeeId;
      expiresAt  = Time.now() + INVITE_TTL_NS;
    };
    inviteToEmployee.add(code, entry);
    #ok(code);
  };

  // Widerruft einen Einladungscode (nur Admin/Manager der zugehörigen Firma)
  public shared ({ caller }) func revokeInviteCode(
    code : Text
  ) : async CommonTypes.Result<()> {
    let entry = switch (inviteToEmployee.get(code)) {
      case null { return #err("Einladungscode nicht gefunden") };
      case (?e) e;
    };
    // Firma des Codes ermitteln
    let ownerEmp = switch (employees.find(func(e) { e.id == entry.employeeId })) {
      case null { return #err("Mitarbeiter nicht gefunden") };
      case (?e) e;
    };
    // Aufrufer muss Admin oder Manager dieser Firma sein
    let callerCompanyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    if (callerCompanyId != ownerEmp.companyId) {
      return #err("Keine Berechtigung: Anderes Unternehmen");
    };
    invRequireAdminOrManager(caller, callerCompanyId);
    inviteToEmployee.remove(code);
    #ok(());
  };

  // Löst einen Einladungscode ein und verknüpft den Aufrufer mit dem Mitarbeiter
  public shared ({ caller }) func redeemInviteCode(
    code : Text
  ) : async CommonTypes.Result<CompanyTypes.Employee> {
    // Prüfen ob der Einladungscode existiert
    let entry = switch (inviteToEmployee.get(code)) {
      case null { return #err("Ungültiger Einladungscode") };
      case (?e) e;
    };
    // Ablaufdatum prüfen
    if (entry.expiresAt < Time.now()) {
      return #err("Einladungscode abgelaufen");
    };
    // Prüfen ob Aufrufer bereits registriert ist
    if (principalToCompany.get(caller) != null) {
      return #err("Diese Identität ist bereits registriert");
    };
    // Mitarbeiter mit Principal verknüpfen
    let success = CompanyLib.linkPrincipalToEmployee(employees, principalToEmployee, entry.employeeId, caller);
    if (not success) {
      return #err("Mitarbeiter nicht gefunden");
    };
    // Principal auch mit Firma verknüpfen
    let emp = switch (employees.find(func(e) { e.id == entry.employeeId })) {
      case null { return #err("Mitarbeiter nicht gefunden") };
      case (?e) e;
    };
    principalToCompany.add(caller, emp.companyId);
    // Einladungscode entfernen (einmalig verwendbar)
    inviteToEmployee.remove(code);
    #ok(emp);
  };
};
