// Platform Admin API – Super-Admin-Funktionen für iReport Onchain V3.1
// Nur der Platform Admin (erster registrierter User) erhält Zugriff.
import Debug "mo:core/Debug";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import ApprovalTypes "../types/timetracking-approval-and-feature-flags";
import CostDashboardTypes "../types/cost-dashboard";

mixin (
  companies : List.List<CompanyTypes.Company>,
  employees : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  platformAdminPrincipal : { var value : ?Principal },
  platformAdminCreatedAt : { var value : Int },
  frontendCanisterIdState : { var value : Text },
  stripeConfigState : { var value : ?CostDashboardTypes.StripeConfig },
  stripeWebhookEndpointUrlState : { var value : Text },
) {
  // Hilfsfunktion: prüft ob der Caller Platform Admin ist
  private func checkIsPlatformAdmin(caller : Principal) : Bool {
    switch (platformAdminPrincipal.value) {
      case (?p) { Principal.equal(p, caller) };
      case null { false };
    };
  };

  // Prüft ob der aufrufende Principal Platform Admin ist
  public query ({ caller }) func isPlatformAdmin() : async Bool {
    checkIsPlatformAdmin(caller);
  };

  // Gibt Platform Admin Infos zurück (nur für Platform Admin)
  public query ({ caller }) func getPlatformAdminInfo() : async ?{
    principal : Text;
    createdAt : Int;
  } {
    if (not checkIsPlatformAdmin(caller)) { return null };
    switch (platformAdminPrincipal.value) {
      case null { null };
      case (?p) {
        ?{
          principal = p.toText();
          createdAt = platformAdminCreatedAt.value;
        };
      };
    };
  };

  // Alle Firmen auflisten (nur für Platform Admin)
  public query ({ caller }) func listAllCompaniesForPlatformAdmin() : async [{
    id : Text;
    name : Text;
    address : ?Text;
    createdAt : Int;
    activeEmployeeCount : Nat;
    inactiveEmployeeCount : Nat;
    isActive : Bool;
  }] {
    if (not checkIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    let result = companies.map<CompanyTypes.Company, { id : Text; name : Text; address : ?Text; createdAt : Int; activeEmployeeCount : Nat; inactiveEmployeeCount : Nat; isActive : Bool }>(
      func(c) {
        let companyEmps = employees.filter(func(e : CompanyTypes.Employee) : Bool {
          e.companyId == c.id
        });
        let activeCount = companyEmps.filter(func(e : CompanyTypes.Employee) : Bool { e.active }).size();
        let inactiveCount = companyEmps.filter(func(e : CompanyTypes.Employee) : Bool { not e.active }).size();
        {
          id = c.id.toText();
          name = c.name;
          address = c.address;
          createdAt = c.createdAt;
          activeEmployeeCount = activeCount;
          inactiveEmployeeCount = inactiveCount;
          isActive = c.isActive;
        };
      }
    );
    result.toArray();
  };

  // Firma aktivieren/deaktivieren (nur für Platform Admin)
  public shared ({ caller }) func setCompanyActive(companyId : Nat, active : Bool) : async { #ok; #err : Text } {
    if (not checkIsPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    // Schutz: Die Firma des Platform-Admins darf nie deaktiviert werden
    if (not active) {
      switch (platformAdminPrincipal.value) {
        case (?paPrincipal) {
          switch (principalToCompany.get(paPrincipal)) {
            case (?paCompanyId) {
              if (paCompanyId == companyId) {
                return #err("Die Firma des Platform-Admins kann nicht deaktiviert werden.");
              };
            };
            case null {};
          };
        };
        case null {};
      };
    };
    var found = false;
    companies.mapInPlace(func(c : CompanyTypes.Company) : CompanyTypes.Company {
      if (c.id == companyId) {
        found := true;
        { c with isActive = active }
      } else { c }
    });
    if (found) { #ok } else { #err("Firma nicht gefunden") };
  };

  // Systemstatistiken (nur für Platform Admin)
  public query ({ caller }) func getSystemStats() : async {
    totalCompanies : Nat;
    totalEmployees : Nat;
  } {
    if (not checkIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    {
      totalCompanies = companies.size();
      totalEmployees = employees.size();
    };
  };

  // Alle Mitarbeiter einer Firma auflisten (nur für Platform Admin)
  public query ({ caller }) func getUsersForCompany(
    companyId : CommonTypes.CompanyId
  ) : async [CompanyTypes.PlatformAdminUserEntry] {
    if (not checkIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    let result = employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.companyId == companyId
    }).map<CompanyTypes.Employee, CompanyTypes.PlatformAdminUserEntry>(func(e) {
      {
        id = e.id;
        firstName = e.firstName;
        lastName = e.lastName;
        email = e.email;
        role = e.role;
        isActive = e.active;
        activatedAt = e.activatedAt;
        deactivatedAt = e.deactivatedAt;
      }
    });
    result.toArray();
  };

  // Rolle eines Mitarbeiters ändern (nur für Platform Admin)
  public shared ({ caller }) func setUserRoleForCompany(
    companyId : CommonTypes.CompanyId,
    employeeId : CommonTypes.EmployeeId,
    role : CompanyTypes.Role,
  ) : async CommonTypes.Result<()> {
    if (not checkIsPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    // Schutz: Rolle des Platform-Admins darf nie geändert werden
    let targetEmpOpt = employees.find(func(e : CompanyTypes.Employee) : Bool {
      e.id == employeeId and e.companyId == companyId
    });
    switch (targetEmpOpt) {
      case (?targetEmp) {
        switch (targetEmp.principalId) {
          case (?pid) {
            switch (platformAdminPrincipal.value) {
              case (?pa) {
                if (Principal.equal(pa, pid)) {
                  return #err("Die Rolle des Platform-Admins kann nicht geändert werden.");
                };
              };
              case null {};
            };
          };
          case null {};
        };
      };
      case null {};
    };
    var found = false;
    employees.mapInPlace(func(e : CompanyTypes.Employee) : CompanyTypes.Employee {
      if (e.id == employeeId and e.companyId == companyId) {
        found := true;
        { e with role }
      } else { e }
    });
    if (found) { #ok(()) } else { #err("Mitarbeiter nicht gefunden") };
  };

  // Mitarbeiter aktivieren/deaktivieren (nur für Platform Admin)
  public shared ({ caller }) func setUserActiveForCompany(
    companyId : CommonTypes.CompanyId,
    employeeId : CommonTypes.EmployeeId,
    active : Bool,
  ) : async CommonTypes.Result<()> {
    if (not checkIsPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    // Schutz: Status des Platform-Admins darf nie geändert werden
    if (not active) {
      let targetEmpOpt = employees.find(func(e : CompanyTypes.Employee) : Bool {
        e.id == employeeId and e.companyId == companyId
      });
      switch (targetEmpOpt) {
        case (?targetEmp) {
          switch (targetEmp.principalId) {
            case (?pid) {
              switch (platformAdminPrincipal.value) {
                case (?pa) {
                  if (Principal.equal(pa, pid)) {
                    return #err("Der Status des Platform-Admins kann nicht geändert werden.");
                  };
                };
                case null {};
              };
            };
            case null {};
          };
        };
        case null {};
      };
    };
    var found = false;
    employees.mapInPlace(func(e : CompanyTypes.Employee) : CompanyTypes.Employee {
      if (e.id == employeeId and e.companyId == companyId) {
        found := true;
        let newActivatedAt : ?Int = if (active and not e.active) { ?Time.now() } else { e.activatedAt };
        // Bei Reaktivierung (false→true): deactivatedAt löschen (null setzen)
        let newDeactivatedAt : ?Int = if (not active and e.active) { ?Time.now() } else if (active and not e.active) { null } else { e.deactivatedAt };
        { e with active; activatedAt = newActivatedAt; deactivatedAt = newDeactivatedAt }
      } else { e }
    });
    if (found) { #ok(()) } else { #err("Mitarbeiter nicht gefunden") };
  };
  // Alle Mitarbeiter einer Firma für die Jahresabrechnung (aktiv + inaktiv)
  // Nur für Platform Admin zugänglich
  public query ({ caller }) func getCompanyEmployeesForBilling(
    companyId : CommonTypes.CompanyId
  ) : async [CompanyTypes.Employee] {
    if (not checkIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    employees.filter(func(e : CompanyTypes.Employee) : Bool {
      e.companyId == companyId
    }).toArray();
  };

  // Gibt die öffentlich sichere Platform-Admin-Konfiguration zurück (keine Secrets)
  public query ({ caller }) func getPlatformAdminConfig() : async ApprovalTypes.PlatformAdminConfigPublic {
    if (not checkIsPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    let publishableKey = switch (stripeConfigState.value) {
      case null { "" };
      case (?cfg) { cfg.publishableKey };
    };
    {
      frontendCanisterId       = frontendCanisterIdState.value;
      stripePublishableKey     = publishableKey;
      stripeWebhookEndpointUrl = stripeWebhookEndpointUrlState.value;
    };
  };

  // Speichert die vollständige Platform-Admin-Konfiguration (inkl. Secrets)
  public shared ({ caller }) func setPlatformAdminConfig(
    config : ApprovalTypes.PlatformAdminConfig
  ) : async CommonTypes.Result<()> {
    if (not checkIsPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    // Frontend Canister-ID speichern
    frontendCanisterIdState.value := config.frontendCanisterId;
    // Stripe-Webhook-Endpoint-URL speichern
    stripeWebhookEndpointUrlState.value := config.stripeWebhookEndpointUrl;
    // Stripe-Konfiguration speichern (Secret Keys nur serverseitig)
    // Nur aktualisieren wenn mindestens ein Key gesetzt ist
    let currentCfg = switch (stripeConfigState.value) {
      case null { { secretKey = ""; publishableKey = ""; webhookSecret = "" } };
      case (?cfg) { cfg };
    };
    let newSecretKey = if (config.stripeSecretKey == "") { currentCfg.secretKey } else { config.stripeSecretKey };
    let newWebhookSecret = if (config.stripeWebhookSecret == "") { currentCfg.webhookSecret } else { config.stripeWebhookSecret };
    let newPublishableKey = if (config.stripePublishableKey == "") { currentCfg.publishableKey } else { config.stripePublishableKey };
    stripeConfigState.value := ?{ secretKey = newSecretKey; publishableKey = newPublishableKey; webhookSecret = newWebhookSecret };
    #ok(());
  };
};

