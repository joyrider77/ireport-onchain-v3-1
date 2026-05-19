// Reine Validierungsbibliothek für numerische und Datumseingaben.
// Alle Funktionen geben Result<(), Text> zurück.
import Text "mo:core/Text";
import CommonTypes "../types/common";

module {

  // Hilfsfunktion: konvertiert ein Ziffernzeichen ('0'–'9') in einen Nat-Wert.
  // Gibt null zurück wenn das Zeichen keine Dezimalziffer ist.
  private func charDigit(c : Char) : ?Nat {
    switch (c) {
      case '0' { ?0 };
      case '1' { ?1 };
      case '2' { ?2 };
      case '3' { ?3 };
      case '4' { ?4 };
      case '5' { ?5 };
      case '6' { ?6 };
      case '7' { ?7 };
      case '8' { ?8 };
      case '9' { ?9 };
      case _   { null };
    }
  };

  // Hilfsfunktion: parst Zeichen arr[from..to-1] als nicht-negativen ganzzahligen Wert.
  // Gibt null zurück wenn ein Zeichen keine Ziffer ist.
  private func parseSlice(arr : [Char], from : Nat, to : Nat) : ?Nat {
    var result : Nat = 0;
    var i = from;
    while (i < to) {
      switch (charDigit(arr[i])) {
        case null  { return null };
        case (?d)  { result := result * 10 + d };
      };
      i += 1;
    };
    ?result
  };

  /// Prüft ob ein Datumsstring dem ISO-8601-Format YYYY-MM-DD entspricht.
  /// Erlaubter Jahresbereich: 1970–2099, Monat: 01–12, Tag: 01–31.
  public func isValidDate(d : Text) : CommonTypes.Result<()> {
    let arr = d.toArray();
    // Genau 10 Zeichen erforderlich
    if (arr.size() != 10) {
      return #err("Ungültiges Datum: Format muss YYYY-MM-DD sein");
    };
    // Trennzeichen an Position 4 und 7 müssen '-' sein
    if (arr[4] != '-' or arr[7] != '-') {
      return #err("Ungültiges Datum: Format muss YYYY-MM-DD sein");
    };
    // Jahr parsen (Positionen 0–3)
    let year = switch (parseSlice(arr, 0, 4)) {
      case null  { return #err("Ungültiges Datum: Jahr enthält ungültige Zeichen") };
      case (?y)  { y };
    };
    // Monat parsen (Positionen 5–6)
    let month = switch (parseSlice(arr, 5, 7)) {
      case null  { return #err("Ungültiges Datum: Monat enthält ungültige Zeichen") };
      case (?m)  { m };
    };
    // Tag parsen (Positionen 8–9)
    let day = switch (parseSlice(arr, 8, 10)) {
      case null  { return #err("Ungültiges Datum: Tag enthält ungültige Zeichen") };
      case (?day) { day };
    };
    // Bereichsprüfungen
    if (year < 1970 or year > 2099) {
      return #err("Ungültiges Datum: Jahr muss zwischen 1970 und 2099 liegen");
    };
    if (month < 1 or month > 12) {
      return #err("Ungültiges Datum: Monat muss zwischen 01 und 12 liegen");
    };
    if (day < 1 or day > 31) {
      return #err("Ungültiges Datum: Tag muss zwischen 01 und 31 liegen");
    };
    #ok(())
  };

  /// Prüft ob eine Stundenangabe im erlaubten Bereich 0.0–24.0 (inklusiv) liegt.
  public func isValidHours(h : Float) : CommonTypes.Result<()> {
    if (h < 0.0 or h > 24.0) {
      return #err("Stunden müssen zwischen 0.0 und 24.0 liegen");
    };
    #ok(())
  };

  /// Prüft ob ein CHF-Betrag im erlaubten Bereich 0.0–999999.99 (inklusiv) liegt.
  public func isValidAmount(a : Float) : CommonTypes.Result<()> {
    if (a < 0.0 or a > 999999.99) {
      return #err("Betrag muss zwischen 0.00 und 999999.99 CHF liegen");
    };
    #ok(())
  };

  /// Prüft ob ein Beschäftigungsgrad (Pensum) im erlaubten Bereich 0–100 (inklusiv) liegt.
  public func isValidPensum(p : Nat) : CommonTypes.Result<()> {
    if (p > 100) {
      return #err("Pensum muss zwischen 0 und 100 liegen");
    };
    #ok(())
  };

}
