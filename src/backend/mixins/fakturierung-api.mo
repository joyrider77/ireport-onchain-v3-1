// Öffentliche API für Fakturierung (Rechnungen, Rechnungsvorlagen)
// iReport Onchain V3.1
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";
import MasterTypes "../types/masterdata";
import TrackingTypes "../types/timetracking";
import FakturTypes "../types/fakturierung";
import AuditTypes "../types/audit";
import AccessControlLib "../lib/AccessControlLib";

mixin (
  accessControlState : AccessControl.AccessControlState,
  companies          : List.List<CompanyTypes.Company>,
  employees          : List.List<CompanyTypes.Employee>,
  principalToCompany : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  customers          : List.List<MasterTypes.Customer>,
  projectMembers     : Map.Map<CommonTypes.ProjectId, [MasterTypes.ProjectMemberAssignment]>,
  timeEntries        : List.List<TrackingTypes.TimeEntry>,
  expenses           : List.List<TrackingTypes.Expense>,
  invoices           : List.List<FakturTypes.Invoice>,
  invoiceTemplatesV2   : List.List<FakturTypes.InvoiceTemplate>,
  nextInvoiceId      : { var value : Nat },
  nextInvoiceTemplateId : { var value : Nat },
  nextInvoicePositionId : { var value : Nat },
  // Audit-Log (append-only)
  auditLogEntries    : List.List<AuditTypes.AuditLogEntry>,
  nextAuditLogId     : { var value : Nat },
) {
  // ─── Hilfsfunktionen ───────────────────────────────────────────────────────

  /// Authentifizierung prüfen; gibt (companyId, employeeId) zurück
  private func fakRequireAuth(caller : Principal) : (CommonTypes.CompanyId, CommonTypes.EmployeeId) {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { Runtime.trap("Nicht authentifiziert") };
      case (?cid) cid;
    };
    let employeeId = switch (principalToEmployee.get(caller)) {
      case null { Runtime.trap("Kein Mitarbeiterdatensatz gefunden") };
      case (?eid) eid;
    };
    (companyId, employeeId);
  };

  /// Audit-Log-Eintrag anhängen (für Rechnungsvorlagen)
  private func fakAppendAudit(
    caller      : Principal,
    companyId   : CommonTypes.CompanyId,
    entityType  : AuditTypes.AuditEntityType,
    operation   : AuditTypes.AuditOperation,
    entityId    : Text,
    beforeState : ?Text,
    afterState  : ?Text,
  ) {
    let logId = "AL-" # nextAuditLogId.value.toText();
    nextAuditLogId.value += 1;
    // Resolve actor name
    let actorName = switch (principalToEmployee.get(caller)) {
      case null { caller.toText() };
      case (?empId) {
        switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
          case null { caller.toText() };
          case (?e) { e.firstName # " " # e.lastName };
        };
      };
    };
    let entry : AuditTypes.AuditLogEntry = {
      id             = logId;
      companyId;
      timestamp      = Time.now();
      operation;
      entityType;
      entityId;
      actorPrincipal = caller.toText();
      actorName;
      beforeState;
      afterState;
      fieldChanges   = null;
    };
    auditLogEntries.add(entry);
  };

  /// Admin/Manager-Rolle prüfen
  private func fakRequireAdminOrManager(caller : Principal, companyId : CommonTypes.CompanyId) : () {
    let company = switch (companies.find(func(c : CompanyTypes.Company) : Bool = c.id == companyId)) {
      case null { Runtime.trap("Firma nicht gefunden") };
      case (?c) c;
    };
    switch (AccessControlLib.requireRole(caller, company, [#admin, #manager], principalToEmployee, employees)) {
      case (#err(msg)) { Runtime.trap(msg) };
      case (#ok(_)) {};
    };
  };

  /// Nur Admin darf Vorlagen verwalten
  private func fakRequireAdmin(caller : Principal, companyId : CommonTypes.CompanyId) : () {
    let company = switch (companies.find(func(c : CompanyTypes.Company) : Bool = c.id == companyId)) {
      case null { Runtime.trap("Firma nicht gefunden") };
      case (?c) c;
    };
    switch (AccessControlLib.requireRole(caller, company, [#admin], principalToEmployee, employees)) {
      case (#err(msg)) { Runtime.trap(msg) };
      case (#ok(_)) {};
    };
  };

  /// Heutiges Datum als Text YYYY-MM-DD aus Time.now() (Nanosekunden → Tage)
  private func todayText() : Text {
    let nowNs : Int = Time.now();
    let nowSec : Int = nowNs / 1_000_000_000;
    let days : Int = nowSec / 86400;
    // Einfache Näherung: Datumsberechnung ab Unix-Epoch (1970-01-01)
    let epoch = days;
    // Zeller-Algorithmus (gregorianisch)
    var z = epoch + 719468;
    let era : Int = (if (z >= 0) z else z - 146096) / 146097;
    let doe : Int = z - era * 146097;
    let yoe : Int = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y : Int = yoe + era * 400;
    let doy : Int = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp : Int = (5 * doy + 2) / 153;
    let d : Int = doy - (153 * mp + 2) / 5 + 1;
    let m : Int = mp + (if (mp < 10) 3 else -9);
    let yr : Int = y + (if (m <= 2) 1 else 0);
    let yrText = if (yr < 1000) "0" # yr.toText() else yr.toText();
    let mText = if (m < 10) "0" # m.toText() else m.toText();
    let dText = if (d < 10) "0" # d.toText() else d.toText();
    yrText # "-" # mText # "-" # dText;
  };

  /// Datum (YYYY-MM-DD) + N Tage → neues Datum YYYY-MM-DD
  private func addDays(dateText : Text, n : Nat) : Text {
    let parts = dateText.split(#char '-');
    let partsArr = parts.toArray();
    if (partsArr.size() != 3) { return dateText };
    let yr  = switch (Nat.fromText(partsArr[0])) { case null 2000; case (?v) v };
    let mo  = switch (Nat.fromText(partsArr[1])) { case null 1;    case (?v) v };
    let dy  = switch (Nat.fromText(partsArr[2])) { case null 1;    case (?v) v };
    // Convert to Julian Day Number, add n, convert back
    let a : Int = (14 - mo) / 12;
    let y : Int = yr + 4800 - a;
    let m : Int = mo + 12 * a - 3;
    var jdn : Int = dy + (153 * m + 2) / 5 + 365 * y + y / 4 - y / 100 + y / 400 - 32045;
    jdn := jdn + n;
    // Convert back
    let p  = jdn + 68569;
    let q  = 4 * p / 146097;
    let r  = p - (146097 * q + 3) / 4;
    let s  = 4000 * (r + 1) / 1461001;
    let t  = r - 1461 * s / 4 + 31;
    let u  = 80 * t / 2447;
    let dd = t - 2447 * u / 80;
    let v  = u / 11;
    let mm = u + 2 - 12 * v;
    let yy = 100 * (q - 49) + s + v;
    let yyText = if (yy < 1000) "0" # yy.toText() else yy.toText();
    let mmText = if (mm < 10) "0" # mm.toText() else mm.toText();
    let ddText = if (dd < 10) "0" # dd.toText() else dd.toText();
    yyText # "-" # mmText # "-" # ddText;
  };

  /// Rechnungsnummer aus Template generieren und Template-Zähler erhöhen
  /// WICHTIG: Präfix wird direkt mit der Nummer verbunden (kein zusätzlicher '-'),
  /// damit "RE-" + "0042" = "RE-0042" und nicht "RE--0042".
  private func generateRechnungsnummer(template : FakturTypes.InvoiceTemplate) : Text {
    let num = template.naechsteNummer;
    let numText = if (num < 10) "000" # num.toText()
                  else if (num < 100) "00" # num.toText()
                  else if (num < 1000) "0" # num.toText()
                  else num.toText();
    template.praefix # numText;
  };

  /// Positionen aufbauen und Beträge berechnen
  private func buildPositionen(
    inputs    : [FakturTypes.InvoicePositionInput],
    invoiceId : Nat,
    startPosId : { var value : Nat },
  ) : ([FakturTypes.InvoicePosition], Float) {
    var zwischensumme : Float = 0.0;
    let positionen = inputs.map(
      func(inp : FakturTypes.InvoicePositionInput) : FakturTypes.InvoicePosition {
        let posTotal = inp.menge * inp.preis;
        zwischensumme += posTotal;
        let pos : FakturTypes.InvoicePosition = {
          id          = startPosId.value;
          invoiceId;
          typ         = inp.typ;
          referenzId  = inp.referenzId;
          bezeichnung = inp.bezeichnung;
          menge       = inp.menge;
          einheit     = inp.einheit;
          preis       = inp.preis;
          total       = posTotal;
        };
        startPosId.value += 1;
        pos;
      }
    );
    (positionen, zwischensumme);
  };

  /// Endbeträge berechnen (nach Rabatt, Skonto, MwSt)
  private func calcTotals(
    zwischensumme : Float,
    rabatt        : Float,
    skonto        : Float,
    mwstSatz      : Float,
  ) : (Float, Float, Float) {
    let rabattBetrag = zwischensumme * rabatt / 100.0;
    let netto        = zwischensumme - rabattBetrag;
    let skontoBetrag = netto * skonto / 100.0;
    let nettoNachSkonto = netto - skontoBetrag;
    let mwstBetrag   = nettoNachSkonto * mwstSatz / 100.0;
    let total        = nettoNachSkonto + mwstBetrag;
    (zwischensumme, mwstBetrag, total);
  };

  // ─── Öffentliche Funktionen ────────────────────────────────────────────────

  /// Erstellt eine neue Rechnung im Status #entwurf
  public shared ({ caller }) func createInvoice(
    input : FakturTypes.CreateInvoiceInput
  ) : async CommonTypes.Result<FakturTypes.Invoice> {
    let (companyId, _) = fakRequireAuth(caller);
    fakRequireAdminOrManager(caller, companyId);

    // Kunde prüfen und Währung ermitteln
    let kunde = switch (customers.find(func(c : MasterTypes.Customer) : Bool = c.id == input.kundeId and c.companyId == companyId)) {
      case null { return #err("Kunde nicht gefunden") };
      case (?c) c;
    };

    // Template ermitteln (muss vorhanden sein für Rechnungsnummer)
    let templateOpt = invoiceTemplatesV2.find(func(t : FakturTypes.InvoiceTemplate) : Bool = t.companyId == companyId);
    let (rechnungsnummer, faelligkeitsdatum, zahlungszielTage) = switch (templateOpt) {
      case null {
        // Kein Template: Standard-Rechnungsnummer und 30 Tage Zahlungsziel
        let num = nextInvoiceId.value;
        let numText = if (num < 10) "000" # num.toText()
                      else if (num < 100) "00" # num.toText()
                      else if (num < 1000) "0" # num.toText()
                      else num.toText();
        let heute = todayText();
        ("RE-" # numText, addDays(heute, 30), 30);
      };
      case (?tmpl) {
        let nr = generateRechnungsnummer(tmpl);
        let heute = todayText();
        let faellig = addDays(heute, tmpl.zahlungszielTage);
        // Template-Zähler erhöhen
        invoiceTemplatesV2.mapInPlace(func(t : FakturTypes.InvoiceTemplate) : FakturTypes.InvoiceTemplate {
          if (t.id == tmpl.id) {
            { t with naechsteNummer = t.naechsteNummer + 1 }
          } else { t }
        });
        (nr, faellig, tmpl.zahlungszielTage);
      };
    };
    ignore zahlungszielTage;

    let invoiceId = nextInvoiceId.value;
    nextInvoiceId.value += 1;

    let (positionen, zwischensumme) = buildPositionen(input.positionen, invoiceId, nextInvoicePositionId);
    let (zs, mwstBetrag, total) = calcTotals(zwischensumme, input.rabatt, input.skonto, input.mwstSatz);

    let invoice : FakturTypes.Invoice = {
      id              = invoiceId;
      companyId;
      kundeId         = input.kundeId;
      rechnungsnummer;
      datum           = todayText();
      faelligkeitsdatum;
      status          = #entwurf;
      positionen;
      kopftext        = input.kopftext;
      fusstext        = input.fusstext;
      mwstSatz        = input.mwstSatz;
      waehrung        = kunde.waehrung;
      rabatt          = input.rabatt;
      skonto          = input.skonto;
      zwischensumme   = zs;
      mwstBetrag;
      total;
      createdBy       = caller;
      createdAt       = Time.now();
      qrAktiv         = switch (input.qrAktiv) {
        case (?v) v;
        case null {
          // Standard aus Vorlage übernehmen
          switch (templateOpt) {
            case (?tmpl) tmpl.qrAktivStandard;
            case null false;
          }
        };
      };
    };
    invoices.add(invoice);
    #ok(invoice);
  };

  /// Aktualisiert eine bestehende Rechnung (nur im Status #entwurf frei editierbar)
  public shared ({ caller }) func updateInvoice(
    invoiceId : Nat,
    input     : FakturTypes.UpdateInvoiceInput,
  ) : async CommonTypes.Result<FakturTypes.Invoice> {
    let (companyId, _) = fakRequireAuth(caller);
    fakRequireAdminOrManager(caller, companyId);

    var result : CommonTypes.Result<FakturTypes.Invoice> = #err("Rechnung nicht gefunden");
    invoices.mapInPlace(func(inv : FakturTypes.Invoice) : FakturTypes.Invoice {
      if (inv.id == invoiceId and inv.companyId == companyId) {
        // Statusübergänge: Entwurf → alles erlaubt; andere Status → nur Statuswechsel
        let newStatus = switch (input.status) {
          case (?s) s;
          case null inv.status;
        };
        // Freie Bearbeitung nur im Entwurf, oder nur Statuswechsel
        let allowEdit = inv.status == #entwurf;
        let newPositionen = switch (input.positionen) {
          case (?posInputs) {
            if (not allowEdit) { inv.positionen }
            else {
              let (pos, _) = buildPositionen(posInputs, inv.id, nextInvoicePositionId);
              pos
            }
          };
          case null inv.positionen;
        };
        let newZwischensumme = newPositionen.foldLeft(
          0.0 : Float, func(acc : Float, p : FakturTypes.InvoicePosition) : Float = acc + p.total
        );
        let newRabatt  = switch (input.rabatt)  { case (?v) v; case null inv.rabatt };
        let newSkonto  = switch (input.skonto)  { case (?v) v; case null inv.skonto };
        let newMwst    = switch (input.mwstSatz) { case (?v) v; case null inv.mwstSatz };
        let (zs, mwstBetrag, total) = calcTotals(newZwischensumme, newRabatt, newSkonto, newMwst);

        // Währung aktualisieren wenn Kunde geändert
        let newWaehrung = switch (input.kundeId) {
          case (?kid) {
            switch (customers.find(func(c : MasterTypes.Customer) : Bool = c.id == kid and c.companyId == companyId)) {
              case null inv.waehrung;
              case (?c) c.waehrung;
            }
          };
          case null inv.waehrung;
        };

        let updated : FakturTypes.Invoice = {
          inv with
          kundeId    = switch (input.kundeId)    { case (?v) v; case null inv.kundeId };
          positionen = newPositionen;
          kopftext   = switch (input.kopftext)   { case (?v) v; case null inv.kopftext };
          fusstext   = switch (input.fusstext)   { case (?v) v; case null inv.fusstext };
          mwstSatz   = newMwst;
          waehrung   = newWaehrung;
          rabatt     = newRabatt;
          skonto     = newSkonto;
          zwischensumme = zs;
          mwstBetrag;
          total;
          datum      = switch (input.datum)      { case (?v) v; case null inv.datum };
          faelligkeitsdatum = switch (input.faelligkeitsdatum) {
            case (?v) v; case null inv.faelligkeitsdatum
          };
          status     = newStatus;
          qrAktiv    = switch (input.qrAktiv)    { case (?v) v; case null inv.qrAktiv };
        };
        result := #ok(updated);
        // Wenn Rechnung storniert wird: Zeiteinträge und Spesen zurücksetzen
        if (newStatus == #storniert and inv.status != #storniert) {
          timeEntries.mapInPlace(func(e : TrackingTypes.TimeEntry) : TrackingTypes.TimeEntry {
            if (e.companyId == companyId and e.fakturiertInRechnungId == ?invoiceId) {
              { e with fakturiertInRechnungId = null }
            } else { e }
          });
          expenses.mapInPlace(func(e : TrackingTypes.Expense) : TrackingTypes.Expense {
            if (e.companyId == companyId and e.fakturiertInRechnungId == ?invoiceId) {
              { e with fakturiertInRechnungId = null }
            } else { e }
          });
        };
        updated;
      } else { inv };
    });
    result;
  };

  /// Storniert eine Rechnung und setzt alle zugehörigen Zeiteinträge und Spesen
  /// zurück auf fakturiertInRechnungId = null, damit sie erneut fakturiert werden können.
  public shared ({ caller }) func cancelInvoice(
    invoiceId : Nat
  ) : async CommonTypes.Result<FakturTypes.Invoice> {
    let (companyId, _) = fakRequireAuth(caller);
    fakRequireAdminOrManager(caller, companyId);

    // Rechnung suchen
    let inv = switch (invoices.find(func(i : FakturTypes.Invoice) : Bool = i.id == invoiceId and i.companyId == companyId)) {
      case null { return #err("Rechnung nicht gefunden") };
      case (?i) i;
    };

    if (inv.status == #storniert) {
      return #err("Rechnung ist bereits storniert");
    };

    // Zeiteinträge zurücksetzen (alle Einträge die dieser Rechnung zugeordnet sind)
    timeEntries.mapInPlace(func(e : TrackingTypes.TimeEntry) : TrackingTypes.TimeEntry {
      if (e.companyId == companyId and e.fakturiertInRechnungId == ?invoiceId) {
        { e with fakturiertInRechnungId = null }
      } else { e }
    });

    // Spesen zurücksetzen
    expenses.mapInPlace(func(e : TrackingTypes.Expense) : TrackingTypes.Expense {
      if (e.companyId == companyId and e.fakturiertInRechnungId == ?invoiceId) {
        { e with fakturiertInRechnungId = null }
      } else { e }
    });

    // Status der Rechnung auf #storniert setzen
    var updatedInv : ?FakturTypes.Invoice = null;
    invoices.mapInPlace(func(i : FakturTypes.Invoice) : FakturTypes.Invoice {
      if (i.id == invoiceId and i.companyId == companyId) {
        let u = { i with status = #storniert };
        updatedInv := ?u;
        u
      } else { i }
    });

    switch (updatedInv) {
      case null { #err("Stornierung fehlgeschlagen") };
      case (?u) { #ok(u) };
    };
  };

  /// Gibt alle Rechnungen der Firma zurück; markiert überfällige automatisch
  public shared ({ caller }) func getInvoices() : async CommonTypes.Result<[FakturTypes.Invoice]> {
    let (companyId, _) = fakRequireAuth(caller);
    fakRequireAdminOrManager(caller, companyId);

    let heute = todayText();
    // Markiert überfällige Rechnungen in-place
    invoices.mapInPlace(func(inv : FakturTypes.Invoice) : FakturTypes.Invoice {
      if (inv.companyId == companyId
          and inv.status == #versendet
          and inv.faelligkeitsdatum < heute) {
        { inv with status = #ueberfaellig }
      } else { inv }
    });

    let result = invoices.filter(func(inv : FakturTypes.Invoice) : Bool {
      inv.companyId == companyId
    }).toArray();
    #ok(result);
  };

  /// Gibt eine einzelne Rechnung nach ID zurück
  public query ({ caller }) func getInvoiceById(
    invoiceId : Nat
  ) : async CommonTypes.Result<FakturTypes.Invoice> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    switch (invoices.find(func(inv : FakturTypes.Invoice) : Bool = inv.id == invoiceId and inv.companyId == companyId)) {
      case null { #err("Rechnung nicht gefunden") };
      case (?inv) { #ok(inv) };
    };
  };

  /// Löscht eine Rechnung (nur im Status #entwurf)
  public shared ({ caller }) func deleteInvoice(
    invoiceId : Nat
  ) : async CommonTypes.Result<()> {
    let (companyId, _) = fakRequireAuth(caller);
    fakRequireAdminOrManager(caller, companyId);

    let inv = switch (invoices.find(func(i : FakturTypes.Invoice) : Bool = i.id == invoiceId and i.companyId == companyId)) {
      case null { return #err("Rechnung nicht gefunden") };
      case (?i) i;
    };
    if (inv.status != #entwurf) {
      return #err("Nur Rechnungen im Status 'Entwurf' können gelöscht werden");
    };
    let before = invoices.size();
    let filtered = invoices.filter(func(i : FakturTypes.Invoice) : Bool {
      not (i.id == invoiceId and i.companyId == companyId)
    });
    invoices.clear();
    invoices.append(filtered);
    if (invoices.size() < before) { #ok(()) }
    else { #err("Löschen fehlgeschlagen") };
  };

  /// Markiert Zeiteinträge und Spesen als fakturiert und setzt Rechnung auf #versendet
  public shared ({ caller }) func markFakturiert(
    invoiceId  : Nat,
    zeitIds    : [Nat],
    expenseIds : [Nat],
  ) : async CommonTypes.Result<()> {
    let (companyId, _) = fakRequireAuth(caller);
    fakRequireAdminOrManager(caller, companyId);

    // Rechnung prüfen
    switch (invoices.find(func(i : FakturTypes.Invoice) : Bool = i.id == invoiceId and i.companyId == companyId)) {
      case null { return #err("Rechnung nicht gefunden") };
      case (?_) {};
    };

    // Zeiteinträge als fakturiert markieren
    timeEntries.mapInPlace(func(e : TrackingTypes.TimeEntry) : TrackingTypes.TimeEntry {
      if (e.companyId == companyId and zeitIds.any(func(id : Nat) : Bool = id == e.id)) {
        { e with fakturiertInRechnungId = ?invoiceId }
      } else { e }
    });

    // Spesen als fakturiert markieren
    expenses.mapInPlace(func(e : TrackingTypes.Expense) : TrackingTypes.Expense {
      if (e.companyId == companyId and expenseIds.any(func(id : Nat) : Bool = id == e.id)) {
        { e with fakturiertInRechnungId = ?invoiceId }
      } else { e }
    });

    // Rechnungsstatus auf #versendet setzen
    invoices.mapInPlace(func(inv : FakturTypes.Invoice) : FakturTypes.Invoice {
      if (inv.id == invoiceId and inv.companyId == companyId) {
        { inv with status = #versendet }
      } else { inv }
    });
    #ok(());
  };

  /// Erstellt oder aktualisiert die Rechnungsvorlage der Firma (nur Admin)
  public shared ({ caller }) func createOrUpdateInvoiceTemplate(
    input : FakturTypes.InvoiceTemplateInput
  ) : async CommonTypes.Result<FakturTypes.InvoiceTemplate> {
    let (companyId, _) = fakRequireAuth(caller);
    fakRequireAdmin(caller, companyId);

    switch (invoiceTemplatesV2.find(func(t : FakturTypes.InvoiceTemplate) : Bool = t.companyId == companyId)) {
      case (?existing) {
        // Vorhandes Template aktualisieren, naechsteNummer beibehalten wenn nicht geändert
        let updated : FakturTypes.InvoiceTemplate = {
          existing with
          praefix          = input.praefix;
          naechsteNummer   = input.naechsteNummer;
          zahlungszielTage = input.zahlungszielTage;
          kopftext         = input.kopftext;
          fusstext         = input.fusstext;
          spalten          = input.spalten;
          farbe            = input.farbe;
          bank             = input.bank;
          iban             = input.iban;
          mwstNummer       = input.mwstNummer;
          mwstSatz         = switch (input.mwstSatz) { case (?v) v; case null existing.mwstSatz };
          kundenadresseAbstandOben        = switch (input.kundenadresseAbstandOben)        { case (?v) ?v; case null existing.kundenadresseAbstandOben };
          kundenadresseAbstandNach        = switch (input.kundenadresseAbstandNach)        { case (?v) ?v; case null existing.kundenadresseAbstandNach };
          kundenadresseLinks              = switch (input.kundenadresseLinks)              { case (?v) ?v; case null existing.kundenadresseLinks };
          kundenadresseEinrueckungZeichen = switch (input.kundenadresseEinrueckungZeichen) { case (?v) ?v; case null existing.kundenadresseEinrueckungZeichen };
          qrIban                = input.qrIban;
          qrKontoinhaber        = input.qrKontoinhaber;
          qrKontoinhaberAdresse = input.qrKontoinhaberAdresse;
          qrWaehrung            = input.qrWaehrung;
          qrReferenztyp         = input.qrReferenztyp;
          qrReferenzPraefix     = input.qrReferenzPraefix;
          qrAktivStandard       = switch (input.qrAktivStandard) { case (?v) v; case null existing.qrAktivStandard };
          kopfzeileBildUrl      = input.kopfzeileBildUrl;
          kopfzeileBildPosition = input.kopfzeileBildPosition;
          fusszeileBildUrl      = input.fusszeileBildUrl;
          fusszeileBildPosition = input.fusszeileBildPosition;
          kopfzeilePosition     = input.kopfzeilePosition;
          fusszeilePosition     = input.fusszeilePosition;
          kopfzeileLogoQuelle   = input.kopfzeileLogoQuelle;
          kopfzeileLogoGroesse  = input.kopfzeileLogoGroesse;
          kopfzeileAdresse      = input.kopfzeileAdresse;
          kopfzeileAdressePosition = input.kopfzeileAdressePosition;
          kopfzeileLayout       = input.kopfzeileLayout;
          fusszeileLayout       = input.fusszeileLayout;
        };
        invoiceTemplatesV2.mapInPlace(func(t : FakturTypes.InvoiceTemplate) : FakturTypes.InvoiceTemplate {
          if (t.id == existing.id) updated else t
        });
        fakAppendAudit(caller, companyId, #invoiceTemplate, #update, existing.id.toText(),
          ?("id=" # existing.id.toText() # " praefix=" # existing.praefix),
          ?("id=" # updated.id.toText() # " praefix=" # updated.praefix));
        #ok(updated);
      };
      case null {
        // Neue Vorlage erstellen
        let id = nextInvoiceTemplateId.value;
        nextInvoiceTemplateId.value += 1;
        let tmpl : FakturTypes.InvoiceTemplate = {
          id;
          companyId;
          praefix          = input.praefix;
          naechsteNummer   = input.naechsteNummer;
          zahlungszielTage = input.zahlungszielTage;
          kopftext         = input.kopftext;
          fusstext         = input.fusstext;
          spalten          = input.spalten;
          farbe            = input.farbe;
          bank             = input.bank;
          iban             = input.iban;
          mwstNummer       = input.mwstNummer;
          mwstSatz         = switch (input.mwstSatz) { case (?v) v; case null 8.1 };
          kundenadresseAbstandOben        = input.kundenadresseAbstandOben;
          kundenadresseAbstandNach        = input.kundenadresseAbstandNach;
          kundenadresseLinks              = input.kundenadresseLinks;
          kundenadresseEinrueckungZeichen = input.kundenadresseEinrueckungZeichen;
          createdAt        = Time.now();
          qrIban                = input.qrIban;
          qrKontoinhaber        = input.qrKontoinhaber;
          qrKontoinhaberAdresse = input.qrKontoinhaberAdresse;
          qrWaehrung            = input.qrWaehrung;
          qrReferenztyp         = input.qrReferenztyp;
          qrReferenzPraefix     = input.qrReferenzPraefix;
          qrAktivStandard       = switch (input.qrAktivStandard) { case (?v) v; case null false };
          kopfzeileBildUrl      = input.kopfzeileBildUrl;
          kopfzeileBildPosition = input.kopfzeileBildPosition;
          fusszeileBildUrl      = input.fusszeileBildUrl;
          fusszeileBildPosition = input.fusszeileBildPosition;
          kopfzeilePosition     = input.kopfzeilePosition;
          fusszeilePosition     = input.fusszeilePosition;
          kopfzeileLogoQuelle   = input.kopfzeileLogoQuelle;
          kopfzeileLogoGroesse  = input.kopfzeileLogoGroesse;
          kopfzeileAdresse      = input.kopfzeileAdresse;
          kopfzeileAdressePosition = input.kopfzeileAdressePosition;
          kopfzeileLayout       = input.kopfzeileLayout;
          fusszeileLayout       = input.fusszeileLayout;
        };
        invoiceTemplatesV2.add(tmpl);
        fakAppendAudit(caller, companyId, #invoiceTemplate, #create, tmpl.id.toText(),
          null,
          ?("id=" # tmpl.id.toText() # " praefix=" # tmpl.praefix));
        #ok(tmpl);
      };
    };
  };

  /// Gibt die Rechnungsvorlage der Firma zurück
  public query ({ caller }) func getInvoiceTemplate() : async CommonTypes.Result<?FakturTypes.InvoiceTemplate> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    #ok(invoiceTemplatesV2.find(func(t : FakturTypes.InvoiceTemplate) : Bool = t.companyId == companyId));
  };

  /// Gibt nicht fakturierte Leistungen (Zeiteinträge und Spesen) zurück
  public query ({ caller }) func getUnbilledEntries(
    kundeId : ?Nat,
  ) : async CommonTypes.Result<{ zeiteintraege : [TrackingTypes.TimeEntry]; spesen : [TrackingTypes.Expense] }> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    let unbilledZeit = timeEntries.filter(func(e : TrackingTypes.TimeEntry) : Bool {
      e.companyId == companyId
      and e.billable == true
      and e.fakturiertInRechnungId == null
    }).toArray();
    let unbilledSpesen = expenses.filter(func(e : TrackingTypes.Expense) : Bool {
      e.companyId == companyId
      and e.status == #approved
      and e.fakturiertInRechnungId == null
      and (switch (kundeId) {
        case null true;
        case (?kid) e.kundeId == ?kid;
      })
    }).toArray();
    #ok({ zeiteintraege = unbilledZeit; spesen = unbilledSpesen });
  };

  /// Gibt nicht fakturierte Leistungen mit angereichertem Stundensatz zurück.
  /// Der Stundensatz wird aus ProjectMemberAssignment (projectId + employeeId + serviceTypeId) ermittelt.
  public query ({ caller }) func getUnbilledEntriesWithRates(
    kundeId : ?Nat,
  ) : async CommonTypes.Result<{ zeiteintraege : [FakturTypes.UnbilledTimeEntry]; spesen : [TrackingTypes.Expense] }> {
    let companyId = switch (principalToCompany.get(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };

    // Hilfsfunktion: Stundensatz für Zeiterfassung aus ProjectMemberAssignment
    let lookupRate = func(projectId : Nat, employeeId : Nat, serviceTypeId : Nat) : Float {
      switch (projectMembers.get(projectId)) {
        case null { 0.0 };
        case (?members) {
          switch (members.find(func(m : MasterTypes.ProjectMemberAssignment) : Bool {
            m.employeeId == employeeId and m.serviceTypeId == serviceTypeId
          })) {
            case null { 0.0 };
            case (?m) { m.stundensatz };
          };
        };
      };
    };

    let unbilledZeit = timeEntries.filter(func(e : TrackingTypes.TimeEntry) : Bool {
      e.companyId == companyId
      and e.billable == true
      and e.fakturiertInRechnungId == null
    }).map<TrackingTypes.TimeEntry, FakturTypes.UnbilledTimeEntry>(
      func(e : TrackingTypes.TimeEntry) : FakturTypes.UnbilledTimeEntry {
        let rate = lookupRate(e.projectId, e.employeeId, e.serviceTypeId);
        {
          id            = e.id;
          companyId     = e.companyId;
          employeeId    = e.employeeId;
          projectId     = e.projectId;
          serviceTypeId = e.serviceTypeId;
          date          = e.date;
          hours         = e.hours;
          von           = e.von;
          bis           = e.bis;
          description   = e.description;
          billable      = e.billable;
          createdAt     = e.createdAt;
          stundensatz   = rate;
          totalCHF      = e.hours * rate;
        }
      }
    ).toArray();

    let unbilledSpesen = expenses.filter(func(e : TrackingTypes.Expense) : Bool {
      e.companyId == companyId
      and e.status == #approved
      and e.fakturiertInRechnungId == null
      and (switch (kundeId) {
        case null true;
        case (?kid) e.kundeId == ?kid;
      })
    }).toArray();

    #ok({ zeiteintraege = unbilledZeit; spesen = unbilledSpesen });
  };
};
