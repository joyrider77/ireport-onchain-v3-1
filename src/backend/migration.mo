// Migration:
//   1. inviteToEmployee Map<Text, EmployeeId> → Map<Text, InviteEntry>
//      Existing codes receive a far-future expiresAt so they remain valid after upgrade.
//   2. companySettings CompanySettings (without allowExpiredVacationBalance)
//      → CompanySettings (with allowExpiredVacationBalance defaulting to false)
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import CommonTypes "types/common";

module {
  // --- Old types (inline, as deployed before this upgrade) ---
  type OldEmployeeId = Nat;

  type OldCompanySettings = {
    companyId : CommonTypes.CompanyId;
    emailNewVacationRequest : Bool;
    emailOnApproval : Bool;
    vacationCarryoverDays : Nat;
    maxVacationDays : Nat;
    approvalRequired : Bool;
    timezone : Text;
  };

  type NewCompanySettings = {
    companyId : CommonTypes.CompanyId;
    emailNewVacationRequest : Bool;
    emailOnApproval : Bool;
    vacationCarryoverDays : Nat;
    maxVacationDays : Nat;
    approvalRequired : Bool;
    timezone : Text;
    allowExpiredVacationBalance : Bool;
  };

  type OldActor = {
    inviteToEmployee : Map.Map<Text, OldEmployeeId>;
    companySettings : Map.Map<CommonTypes.CompanyId, OldCompanySettings>;
  };

  // --- New types ---
  type NewActor = {
    inviteToEmployee : Map.Map<Text, CommonTypes.InviteEntry>;
    companySettings : Map.Map<CommonTypes.CompanyId, NewCompanySettings>;
  };

  // Far-future timestamp: year 2100-01-01 in nanoseconds
  // = 4102444800 seconds * 1_000_000_000
  let FAR_FUTURE_NS : CommonTypes.Timestamp = 4_102_444_800_000_000_000;

  public func run(old : OldActor) : NewActor {
    let inviteToEmployee = old.inviteToEmployee.map<Text, OldEmployeeId, CommonTypes.InviteEntry>(
      func(_code, employeeId) {
        { employeeId = employeeId; expiresAt = FAR_FUTURE_NS };
      }
    );
    let companySettings = old.companySettings.map<CommonTypes.CompanyId, OldCompanySettings, NewCompanySettings>(
      func(_id, s) {
        {
          companyId = s.companyId;
          emailNewVacationRequest = s.emailNewVacationRequest;
          emailOnApproval = s.emailOnApproval;
          vacationCarryoverDays = s.vacationCarryoverDays;
          maxVacationDays = s.maxVacationDays;
          approvalRequired = s.approvalRequired;
          timezone = s.timezone;
          allowExpiredVacationBalance = false;
        }
      }
    );
    { inviteToEmployee; companySettings };
  };
};
