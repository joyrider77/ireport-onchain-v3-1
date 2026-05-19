// Migration: VacationLedger – calendarYearKey hinzugefügt
// Altes VacationLedger hatte kein calendarYearKey-Feld.
// Neues VacationLedger enthält calendarYearKey (4-stelliges Jahr als Text).
// Migration: calendarYearKey = serviceYearKey (serviceYearKey wurde bereits als Jahr-String gesetzt).
import List "mo:core/List";

module {

  // Alter VacationLedger-Typ (ohne calendarYearKey)
  type OldVacationLedger = {
    id : Nat;
    employeeId : Nat;
    companyId : Nat;
    serviceYearKey : Text;
    serviceYearStart : Int;
    serviceYearEnd : Int;
    gesetzlicheFerientage : Float;
    vertraglicheZusatzferienTage : Float;
    geplanteFerientage : Float;
    bezogeneFerientage : Float;
    verbleibendeFerientage : Float;
    laengsterZusammenhangenderBlock : Int;
    twoWeekBlockSatisfied : Bool;
    lastUpdatedAt : Int;
  };

  // Neuer VacationLedger-Typ (mit calendarYearKey)
  type NewVacationLedger = {
    id : Nat;
    employeeId : Nat;
    companyId : Nat;
    serviceYearKey : Text;
    calendarYearKey : Text;
    serviceYearStart : Int;
    serviceYearEnd : Int;
    gesetzlicheFerientage : Float;
    vertraglicheZusatzferienTage : Float;
    geplanteFerientage : Float;
    bezogeneFerientage : Float;
    verbleibendeFerientage : Float;
    laengsterZusammenhangenderBlock : Int;
    twoWeekBlockSatisfied : Bool;
    lastUpdatedAt : Int;
  };

  type OldActor = {
    vacationLedgers : List.List<OldVacationLedger>;
  };

  type NewActor = {
    vacationLedgers : List.List<NewVacationLedger>;
  };

  public func run(old : OldActor) : NewActor {
    let vacationLedgers = old.vacationLedgers.map<OldVacationLedger, NewVacationLedger>(
      func(l) {
        // serviceYearKey war bereits als Kalenderjahr-String gesetzt (z.B. "2024").
        // calendarYearKey erhält denselben Wert; leere Strings werden auf "" belassen.
        { l with calendarYearKey = l.serviceYearKey };
      }
    );
    { vacationLedgers };
  };
};
