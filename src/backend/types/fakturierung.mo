// Typen für das Fakturierungsmodul von iReport Onchain V3.1
import CommonTypes "common";

module {
  public type CompanyId  = CommonTypes.CompanyId;
  public type CustomerId = CommonTypes.CustomerId;
  public type Timestamp  = CommonTypes.Timestamp;

  // Rechnungsstatus
  public type InvoiceStatus = {
    #entwurf;
    #versendet;
    #bezahlt;
    #storniert;
    #ueberfaellig;
  };

  // Positionstyp
  public type InvoicePositionTyp = {
    #leistung;
    #spese;
    #freitext;
  };

  // Rechnungsposition
  public type InvoicePosition = {
    id         : Nat;
    invoiceId  : Nat;
    typ        : InvoicePositionTyp;
    referenzId : ?Nat;   // ID des Zeiteintrags oder der Spese
    bezeichnung : Text;
    menge      : Float;
    einheit    : Text;
    preis      : Float;
    total      : Float;
  };

  // Rechnung
  public type Invoice = {
    id              : Nat;
    companyId       : CompanyId;
    kundeId         : CustomerId;
    rechnungsnummer : Text;
    datum           : Text;   // YYYY-MM-DD
    faelligkeitsdatum : Text; // YYYY-MM-DD
    status          : InvoiceStatus;
    positionen      : [InvoicePosition];
    kopftext        : Text;
    fusstext        : Text;
    mwstSatz        : Float;   // z.B. 8.1 für 8.1%
    waehrung        : Text;    // z.B. "CHF", "EUR"
    rabatt          : Float;   // Rabatt in Prozent
    skonto          : Float;   // Skonto in Prozent
    zwischensumme   : Float;
    mwstBetrag      : Float;
    total           : Float;
    createdBy       : Principal;
    createdAt       : Timestamp;
    // QR-Rechnung: ob auf dieser Rechnung ein QR-Zahlschein gedruckt werden soll
    qrAktiv         : Bool;
  };

  // Rechnungsvorlage
  public type InvoiceTemplate = {
    id             : Nat;
    companyId      : CompanyId;
    praefix        : Text;   // z.B. "RE"
    naechsteNummer : Nat;    // laufende Nummer, wird nach Erstellung inkrementiert
    zahlungszielTage : Nat;  // z.B. 30
    kopftext       : Text;
    fusstext       : Text;
    spalten        : [Text]; // Konfigurierbare Spalten
    farbe          : Text;
    bank           : Text;
    iban           : Text;
    mwstNummer     : Text;
    mwstSatz       : Float;  // Standard-MwSt-Satz in Prozent, z.B. 8.1
    createdAt      : Timestamp;
    // Kundenadresse Positionierung
    kundenadresseAbstandOben        : ?Float; // Vertikaler Abstand vom Seitenoberrand in mm (z.B. 45.0)
    kundenadresseAbstandNach        : ?Nat;   // Vertikaler Abstand nach der Adresse bis zum nächsten Block in mm (Standard: 10)
    kundenadresseLinks              : ?Bool;  // true = links, false = rechts (Standard: true)
    kundenadresseEinrueckungZeichen : ?Nat;   // Horizontale Einrückung in Zeichen (z.B. 0)
    // QR-Rechnung Felder
    qrIban                  : ?Text;  // IBAN für QR-Zahlschein
    qrKontoinhaber          : ?Text;  // Kontoinhaber (falls abweichend)
    qrKontoinhaberAdresse   : ?Text;  // Adresse des Kontoinhabers
    qrWaehrung              : ?Text;  // "CHF" oder "EUR"
    qrReferenztyp           : ?Text;  // "QRR", "SCOR" oder "NON"
    qrReferenzPraefix       : ?Text;  // Optionales Präfix für QR-Referenznummer
    qrAktivStandard         : Bool;   // Standard-Wert für QR-Toggle auf neuen Rechnungen
    // Kopf-/Fussbild Felder
    kopfzeileBildUrl        : ?Text;  // URL des Kopfzeilen-Bildes
    kopfzeileBildPosition   : ?Text;  // "links", "zentriert", "rechts"
    fusszeileBildUrl        : ?Text;  // URL des Fusszeilen-Bildes
    fusszeileBildPosition   : ?Text;  // "links", "zentriert", "rechts"
    // Positionierung von Kopf-/Fusszeilen-Text
    kopfzeilePosition       : ?Text;  // "links", "zentriert", "rechts"
    fusszeilePosition       : ?Text;  // "links", "zentriert", "rechts"
    // Erweiterter Kopfbereich
    kopfzeileLogoQuelle     : ?Text;  // "stammdaten" | "upload"
    kopfzeileLogoGroesse    : ?Text;  // "small" | "medium" | "large"
    kopfzeileAdresse        : ?Text;  // Freier Adresstext
    kopfzeileAdressePosition : ?Text; // "links" | "zentriert" | "rechts"
    kopfzeileLayout         : ?Text;  // "nebeneinander" | "uebereinander"
    // Erweiterter Fussbereich
    fusszeileLayout         : ?Text;  // "nebeneinander" | "uebereinander"
  };

  // Angereicherter Zeiteintrag für Fakturierungsübersicht (mit Stundensatz aus ProjectMemberAssignment)
  public type UnbilledTimeEntry = {
    id             : Nat;
    companyId      : Nat;
    employeeId     : Nat;
    projectId      : Nat;
    serviceTypeId  : Nat;
    date           : Text;
    hours          : Float;
    von            : ?Text;
    bis            : ?Text;
    description    : Text;
    billable       : Bool;
    createdAt      : Int;
    stundensatz    : Float;  // Stundensatz aus ProjectMemberAssignment (employeeId + serviceTypeId)
    totalCHF       : Float;  // hours * stundensatz
  };

  // Eingabe für eine Rechnungsposition
  public type InvoicePositionInput = {
    typ        : InvoicePositionTyp;
    referenzId : ?Nat;
    bezeichnung : Text;
    menge      : Float;
    einheit    : Text;
    preis      : Float;
  };

  // Eingabe für eine neue Rechnung
  public type CreateInvoiceInput = {
    kundeId    : CustomerId;
    positionen : [InvoicePositionInput];
    kopftext   : Text;
    fusstext   : Text;
    mwstSatz   : Float;
    rabatt     : Float;
    skonto     : Float;
    qrAktiv    : ?Bool;  // Ob QR-Zahlschein auf dieser Rechnung gedruckt werden soll
  };

  // Eingabe für die Aktualisierung einer Rechnung
  public type UpdateInvoiceInput = {
    kundeId    : ?CustomerId;
    positionen : ?[InvoicePositionInput];
    kopftext   : ?Text;
    fusstext   : ?Text;
    mwstSatz   : ?Float;
    rabatt     : ?Float;
    skonto     : ?Float;
    datum      : ?Text;
    faelligkeitsdatum : ?Text;
    status     : ?InvoiceStatus;
    qrAktiv    : ?Bool;  // Ob QR-Zahlschein auf dieser Rechnung gedruckt werden soll
  };

  // Eingabe für eine Rechnungsvorlage
  public type InvoiceTemplateInput = {
    praefix          : Text;
    naechsteNummer   : Nat;
    zahlungszielTage : Nat;
    kopftext         : Text;
    fusstext         : Text;
    spalten          : [Text];
    farbe            : Text;
    bank             : Text;
    iban             : Text;
    mwstNummer       : Text;
    mwstSatz         : ?Float;  // Standard-MwSt-Satz in Prozent (z.B. 8.1); null = 8.1 als Standard
    // Kundenadresse Positionierung (optional)
    kundenadresseAbstandOben        : ?Float;
    kundenadresseAbstandNach        : ?Nat;   // Vertikaler Abstand nach der Adresse in mm (Standard: 10)
    kundenadresseLinks              : ?Bool;  // true = links, false = rechts (Standard: true)
    kundenadresseEinrueckungZeichen : ?Nat;
    // QR-Rechnung Felder (optional)
    qrIban                  : ?Text;
    qrKontoinhaber          : ?Text;
    qrKontoinhaberAdresse   : ?Text;
    qrWaehrung              : ?Text;
    qrReferenztyp           : ?Text;
    qrReferenzPraefix       : ?Text;
    qrAktivStandard         : ?Bool;
    // Kopf-/Fussbild Felder (optional)
    kopfzeileBildUrl        : ?Text;
    kopfzeileBildPosition   : ?Text;
    fusszeileBildUrl        : ?Text;
    fusszeileBildPosition   : ?Text;
    // Positionierung von Kopf-/Fusszeilen-Text (optional)
    kopfzeilePosition       : ?Text;
    fusszeilePosition       : ?Text;
    // Erweiterter Kopfbereich (optional)
    kopfzeileLogoQuelle     : ?Text;
    kopfzeileLogoGroesse    : ?Text;
    kopfzeileAdresse        : ?Text;
    kopfzeileAdressePosition : ?Text;
    kopfzeileLayout         : ?Text;
    // Erweiterter Fussbereich (optional)
    fusszeileLayout         : ?Text;
  };
};
