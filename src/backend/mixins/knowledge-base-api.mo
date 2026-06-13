// Wissensbasis-Mixin für die Support-KI – iReport Onchain V3.1
// Speichert FAQs, Feature-Beschreibungen, Anleitungen, Hilfetexte und Vertrauenstexte
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import CommonTypes "../types/common";
import KbTypes "../types/knowledge-base";

mixin (
  platformAdminPrincipal : { var value : ?Principal },
  knowledgeEntries       : List.List<KbTypes.KnowledgeEntry>,
  knowledgeBaseInitialized : { var value : Bool },
) {

  // ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

  private func checkIsKbPlatformAdmin(caller : Principal) : Bool {
    switch (platformAdminPrincipal.value) {
      case (?p) { Principal.equal(p, caller) };
      case null { false };
    };
  };

  private func generateKbId() : Text {
    let ts = Time.now();
    "kb-" # ts.toText();
  };

  // ─── Initialisierung der Standard-Wissensbasis ────────────────────────────────

  private func initKnowledgeBase() {
    if (knowledgeBaseInitialized.value) { return };
    knowledgeBaseInitialized.value := true;

    let now = Time.now();

    // Helper um Einträge hinzuzufügen
    func add(id : Text, category : Text, title : Text, content : Text, role : Text) {
      knowledgeEntries.add({
        id;
        category;
        title;
        content;
        language = "de";
        role;
        isActive = true;
        createdAt = now;
        updatedAt = now;
      });
    };

    // ── FAQs ──────────────────────────────────────────────────────────────────
    add("kb-faq-01", "faq", "Wie erfasse ich meine Arbeitszeit?",
      "Gehe zu 'Zeiten erfassen' im Seitenmenü. Klicke auf 'Neue Zeit erfassen', wähle Datum, Startzeit, Endzeit und optionalen Kommentar. Bestätige mit Speichern. Du kannst auch die Stoppuhr im Header verwenden.",
      "all");

    add("kb-faq-02", "faq", "Wie reiche ich einen Rapport zur Genehmigung ein?",
      "Zeiteinträge werden automatisch dem zugewiesenen Vorgesetzten zur Genehmigung vorgelegt. Unter 'Genehmigungen' siehst du den Status deiner eingereichten Rapporte.",
      "all");

    add("kb-faq-03", "faq", "Wie erfasse ich eine Absenz?",
      "Gehe zu 'Zeiten erfassen' und wähle den Reiter 'Absenzen'. Wähle die Abwesenheitsart, Zeitraum und optionalen Kommentar. Wenn die Abwesenheitsart eine Genehmigung erfordert, wird sie dem Vorgesetzten zur Freigabe vorgelegt.",
      "all");

    add("kb-faq-04", "faq", "Wie erfasse ich Spesen?",
      "Gehe zu 'Zeiten erfassen' und wähle den Reiter 'Spesen'. Erfasse Datum, Betrag, Währung, Kategorie und Beschreibung. Spesen können ebenfalls einem Genehmigungsprozess unterliegen.",
      "all");

    add("kb-faq-05", "faq", "Wie melde ich mich an?",
      "iReport Onchain verwendet Internet Identity für die sichere Anmeldung. Klicke auf 'Anmelden' und folge den Anweisungen von Internet Identity. Du benötigst ein registriertes Gerät oder einen Passkey.",
      "all");

    add("kb-faq-06", "faq", "Sind meine Daten sicher?",
      "Ja. iReport Onchain speichert alle Daten direkt auf dem Internet Computer (ICP) in einem dezentralen Canister. Die Daten sind verschlüsselt, unveränderlich protokolliert und nicht an einen einzelnen Serverstandort gebunden.",
      "all");

    add("kb-faq-07", "faq", "Was ist ein Genehmigungsworkflow?",
      "Bestimmte Einträge wie Absenzen oder Zeitrapporte können einer Genehmigungspflicht unterliegen. Der Vorgesetzte erhält eine Benachrichtigung und kann die Einträge genehmigen oder ablehnen. Unter 'Genehmigungen' siehst du alle ausstehenden und erledigten Genehmigungen.",
      "all");

    add("kb-faq-08", "faq", "Wie funktionieren Benachrichtigungen?",
      "Benachrichtigungen erscheinen als Glocken-Icon im Header. Klicke darauf um deine Nachrichten zu lesen. Administratoren können Nachrichten an einzelne Benutzer, Rollen oder alle Mitarbeitenden senden.",
      "all");

    // ── Feature-Beschreibungen ────────────────────────────────────────────────
    add("kb-feat-01", "feature", "Dashboard",
      "Das Dashboard zeigt eine interaktive Übersicht deiner Arbeitszeiten mit Drill-Down von Jahr über Monat bis zum einzelnen Tag. Du siehst Soll- vs. Ist-Stunden als gestapelte Balken und kannst nach Mitarbeitenden filtern (Admin/Manager).",
      "all");

    add("kb-feat-02", "feature", "Kalenderübersicht",
      "Der Kalender zeigt alle deine Zeiten, Ferien und Abwesenheiten in einer monatlichen Übersicht. Du kannst direkt im Kalender neue Einträge erstellen oder bestehende bearbeiten. Kalenderwochen werden als KWxx angezeigt. Andere Mitarbeitende sind gemäss den Sichtbarkeitsregeln sichtbar.",
      "all");

    add("kb-feat-03", "feature", "Zeiterfassung",
      "Unter 'Zeiten erfassen' kannst du Arbeitsstunden, Absenzen und Spesen erfassen. Die Stoppuhr im Header ermöglicht die Live-Zeiterfassung. Alle Einträge folgen dem Format TT.MM.JJJJ und hh:mm.",
      "all");

    add("kb-feat-04", "feature", "Auswertungen",
      "Im Bereich Auswertungen findest du detaillierte Reports über Arbeitszeiten, Abwesenheiten und Spesen. Du kannst nach Zeitraum und Mitarbeitenden filtern und die Daten als CSV exportieren.",
      "all");

    add("kb-feat-05", "feature", "Fakturierung",
      "Der Rechnungseditor ermöglicht die Erstellung von Rechnungen mit QR-Code (Swiss Payment Standards 2.0). Rechnungen können als PDF exportiert werden. Es gibt ein Mahnsystem und einen Status-Workflow.",
      "all");

    add("kb-feat-06", "feature", "Stammdaten",
      "Unter Stammdaten verwaltest du Mitarbeitende, Kunden, Projekte, Kostenstellen, Abwesenheitsarten und Arbeitszeitsollvorgaben. Hier werden auch Beschäftigungsverhältnisse und Vorgesetzte konfiguriert.",
      "all");

    add("kb-feat-07", "feature", "Genehmigungen",
      "Der Bereich Genehmigungen ist für Manager und Admins zugänglich. Hier können ausstehende Zeitrapporte und Absenzen genehmigt oder abgelehnt werden. Filter nach Mitarbeitenden, Status und Monat sind verfügbar.",
      "all");

    add("kb-feat-08", "feature", "HR & Compliance",
      "Das HR & Compliance-Modul prüft Arbeitszeiten und Abwesenheiten automatisch gegen Schweizer Arbeitsrecht (OR). Es zeigt KPI-Kacheln für Überstunden, Ruhezeiten, Pausen und Ferienminimum. Verstösse können quittiert werden.",
      "all");

    add("kb-feat-09", "feature", "Abonnementverwaltung",
      "Unter Einstellungen kannst du dein Abonnement und die Zahlungsmodalität verwalten. Ein Planwechsel zeigt die Kostenfolge. Die Abrechnungsübersicht zeigt aktuelle und vergangene Rechnungen.",
      "all");

    // ── Schritt-für-Schritt-Anleitungen ─────────────────────────────────────
    add("kb-guide-01", "guide", "Schritt-für-Schritt: Arbeitszeit erfassen",
      "1. Klicke im Menü auf 'Zeiten erfassen'. 2. Klicke auf 'Neue Zeit'. 3. Wähle das Datum (TT.MM.JJJJ). 4. Gib Startzeit und Endzeit ein (hh:mm). 5. Optionaler Kommentar. 6. Klicke auf 'Speichern'. Alternativ: Stoppuhr im Header starten und nach der Arbeit stoppen.",
      "all");

    add("kb-guide-02", "guide", "Schritt-für-Schritt: Absenz erfassen",
      "1. Gehe zu 'Zeiten erfassen' > Reiter 'Absenzen'. 2. Wähle Abwesenheitsart (z.B. Ferien, Krankheit). 3. Wähle Von-Datum und Bis-Datum. 4. Optionaler Kommentar. 5. Speichern. Bei genehmigungspflichtigen Abwesenheiten wird der Vorgesetzte automatisch benachrichtigt.",
      "all");

    add("kb-guide-03", "guide", "Schritt-für-Schritt: Spesen erfassen",
      "1. Gehe zu 'Zeiten erfassen' > Reiter 'Spesen'. 2. Klicke auf 'Neue Spese'. 3. Wähle Datum und Kategorie. 4. Erfasse Betrag und Währung. 5. Füge eine Beschreibung hinzu. 6. Speichern.",
      "all");

    // ── Rollenbasierte Hilfetexte ─────────────────────────────────────────────
    add("kb-help-01", "help", "Hilfe für Administratoren",
      "Als Administrator hast du Zugriff auf alle Funktionen der App: Stammdatenverwaltung, Auswertungen aller Mitarbeitenden, Genehmigungsrübersicht, Fakturierung, Benachrichtigungen und Abonnementverwaltung. Du kannst Mitarbeitende, Kunden, Projekte und alle Stammdaten verwalten.",
      "admin");

    add("kb-help-02", "help", "Hilfe für Manager",
      "Als Manager kannst du die Zeiten und Absenzen deiner Mitarbeitenden einsehen, genehmigen oder ablehnen. Unter 'Genehmigungen' siehst du alle ausstehenden Anfragen. Im Dashboard kannst du die Zeitübersichten deiner Mitarbeitenden analysieren.",
      "manager");

    add("kb-help-03", "help", "Hilfe für Mitarbeitende",
      "Als Mitarbeitender kannst du deine eigenen Arbeitszeiten, Absenzen und Spesen erfassen. Im Dashboard siehst du deine persönliche Zeitübersicht. Über die Glocke oben rechts erhältst du Benachrichtigungen. Der Chat-Assistent beantwortet deine Fragen zur App.",
      "mitarbeiter");

    // ── Onchain-Vertrauenstexte ───────────────────────────────────────────────
    add("kb-trust-01", "trust", "Datensicherheit auf dem Internet Computer",
      "iReport Onchain speichert alle Daten in einem Canister auf dem Internet Computer (ICP). Das bedeutet: Keine zentrale Datenbank, kein einzelner Angriffspunkt. Deine Daten sind über ein dezentrales Netzwerk repliziert und jederzeit verfügbar.",
      "all");

    add("kb-trust-02", "trust", "Unveränderliche Audit-Protokolle",
      "Jede Änderung an Daten wird in einem Audit-Protokoll festgehalten. Diese Protokolle sind unveränderlich und können nicht nachträglich manipuliert werden – das garantiert Transparenz und Compliance.",
      "all");

    add("kb-trust-03", "trust", "Sicherer Login mit Internet Identity",
      "Die Anmeldung bei iReport Onchain erfolgt ausschliesslich über Internet Identity. Dabei wird kein Passwort gespeichert. Stattdessen verwendet Internet Identity kryptographische Schlüssel (Passkey/Biometrie), die an dein Gerät gebunden sind.",
      "all");

    // ── Neue Funktionen (Punkt 45) ────────────────────────────────────────────
    addNewEntries_(now);
  };

  // Neue Einträge (seit letzter Wissensbasis-Aktualisierung)
  // Wird sowohl bei der Erst-Initialisierung als auch bei der Migration aufgerufen.
  private func addNewEntries_(now : Int) {
    func add(id : Text, category : Text, title : Text, content : Text, role : Text) {
      // Doppelte IDs vermeiden
      let exists = knowledgeEntries.find(func(e : KbTypes.KnowledgeEntry) : Bool { e.id == id });
      switch (exists) {
        case (?_) { /* bereits vorhanden, nicht erneut hinzufügen */ };
        case null {
          knowledgeEntries.add({
            id;
            category;
            title;
            content;
            language = "de";
            role;
            isActive = true;
            createdAt = now;
            updatedAt = now;
          });
        };
      };
    };

    add("kb-feat-10", "feature", "Compliance-Profil",
      "Das Compliance-Profil speichert mitarbeiter-spezifische Regelparameter für die automatisierte Compliance-Prüfung. Die vertraglichen Wochenstunden werden automatisch aus der aktuell gültigen Beschäftigung (Stammdaten) berechnet und als read-only angezeigt. Weitere Felder wie gesetzliche Wochenhöchstarbeitszeit, Zusatzferien, Ferienanspruch und Ausnahmeprofil sind editierbar. Die Compliance-Engine verwendet diese individuellen Werte statt der globalen Standardregeln.",
      "admin");

    add("kb-feat-11", "feature", "Automatische Standardpläne bei erster Registrierung",
      "Beim ersten Start der App (erste Registrierung als Platform-Admin) werden automatisch zwei Abonnementpläne angelegt: 'Basis' (CHF 10/Monat, max. 2 Mitarbeitende) und 'Professional' (CHF 11/Monat, unbegrenzte Mitarbeitende, Empfohlen). Die Pläne sind sofort in der Abonnement-Konfiguration sichtbar und auf der Startseite verfügbar.",
      "all");

    add("kb-feat-12", "feature", "Direkte Weiterleitung zu Internet Identity bei Anmeldung",
      "Ein Klick auf 'Anmelden' auf der Startseite leitet direkt zur Internet Identity Anmeldung weiter – ohne Zwischenseite. Die Registrierung ist nur über 'Jetzt starten' in den Preiskacheln möglich, damit Plan und Zahlungsmodalität korrekt übernommen werden.",
      "all");

    add("kb-feat-13", "feature", "Registrierung mit Plan-Auswahl",
      "Neue Mandanten registrieren sich über 'Jetzt starten' in einer Preiskachel auf der Startseite. Der gewählte Plan (z.B. Basis oder Professional) und die Zahlungsmodalität (monatlich oder jährlich) werden automatisch in das Registrierungsformular übernommen und nach erfolgreicher Registrierung in der Mandantenübersicht und Abrechnungsübersicht gespeichert.",
      "all");

    add("kb-feat-14", "feature", "Chat-Widget und Support-KI",
      "Das Chat-Widget ist für alle eingeloggten Benutzer sichtbar (Admin, Manager, Mitarbeitende). Es verbindet sich mit einem OpenAI GPT-Assistenten, der Fragen zur App auf Deutsch und Englisch beantwortet. Die Wissensbasis (FAQs, Anleitungen, Feature-Beschreibungen) dient als Kontext für die KI. Der Chat-Button ist nur aktiv, wenn ein OpenAI API Key konfiguriert ist.",
      "all");

    add("kb-feat-15", "feature", "Wissensbasis-Verwaltung (Platform Admin)",
      "Unter Platform-Admin > KI-Konfiguration > Wissensbasis können alle Einträge der Support-KI-Wissensbasis verwaltet werden. Einträge können hinzugefügt, bearbeitet und gelöscht werden. Es stehen Filter nach Kategorie und Rolle zur Verfügung. Die Wissensbasis enthält FAQs, Feature-Beschreibungen, Anleitungen, Hilfetexte und Vertrauenstexte.",
      "admin");

    add("kb-help-04", "help", "Compliance-Profil: Anleitung für Admins",
      "Das Compliance-Profil eines Mitarbeiters findest du unter HR & Compliance > Mitarbeiter-Detail > Compliance-Profil. Du kannst dort die gesetzliche Wochenhöchstarbeitszeit, vertragliche Zusatzferien, gesetzlichen Ferienanspruch, das Ausnahmeprofil und ob die Compliance-Prüfung aktiv ist, einstellen. Die vertraglichen Wochenstunden werden automatisch aus der aktuell gültigen Beschäftigung berechnet – du musst diesen Wert nicht manuell pflegen.",
      "admin");

    add("kb-faq-09", "faq", "Wozu dient das Compliance-Profil?",
      "Das Compliance-Profil speichert individuelle Regelparameter für einen Mitarbeiter. Die Compliance-Engine prüft Zeiterfassungen, Absenzen und Ferien gegen diese Werte statt gegen die globalen Standardregeln. Zum Beispiel: Hat ein Mitarbeiter 32 Stunden/Woche vertraglich, werden Überstunden ab 32 Stunden gemeldet. Die vertraglichen Wochenstunden werden automatisch aus der Beschäftigung berechnet.",
      "all");

    add("kb-faq-10", "faq", "Wie wähle ich beim Registrieren einen Abonnementplan?",
      "Klicke auf der Startseite bei den Preiskacheln auf 'Jetzt starten'. Du wirst direkt zur Registrierung weitergeleitet, wobei der gewählte Plan und die Zahlungsmodalität (monatlich oder jährlich) automatisch übernommen werden. Nach erfolgreicher Registrierung sind Plan und Abrechnungsmodalität in der Platform-Admin-Übersicht sichtbar.",
      "all");

    add("kb-faq-11", "faq", "Wie nutze ich den Chat-Assistenten?",
      "Klicke auf das Chat-Symbol unten rechts in der App. Stelle deine Frage auf Deutsch oder Englisch – der Assistent erkennt die Sprache automatisch und antwortet entsprechend. Wenn kein API Key konfiguriert ist, bleibt der Chat-Button deaktiviert. Bei technischen Problemen wende dich an den Support.",
      "all");
  };

  // Wissensbasis beim ersten Laden initialisieren
  do { initKnowledgeBase() };

  // Neue Einträge zu bestehenden Canisters hinzufügen (Migration für Punkt 45)
  do { addNewEntries_(Time.now()) };

  // ─── Öffentliche API ──────────────────────────────────────────────────────────

  // Alle aktiven Einträge abrufen (kein Auth erforderlich – nur aktive)
  public query func getKnowledgeEntries() : async [KbTypes.KnowledgeEntry] {
    knowledgeEntries
      .filter(func(e : KbTypes.KnowledgeEntry) : Bool { e.isActive })
      .toArray();
  };

  // Alle Einträge abrufen inkl. inaktive (Platform Admin only)
  public query ({ caller }) func getKnowledgeEntriesAdmin() : async [KbTypes.KnowledgeEntry] {
    if (not checkIsKbPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    knowledgeEntries.toArray();
  };

  // Eintrag hinzufügen (Platform Admin only)
  public shared ({ caller }) func addKnowledgeEntry(
    entry : { category : Text; title : Text; content : Text; language : Text; role : Text; isActive : Bool }
  ) : async CommonTypes.Result<KbTypes.KnowledgeEntry> {
    if (not checkIsKbPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let now = Time.now();
    let newEntry : KbTypes.KnowledgeEntry = {
      id        = generateKbId();
      category  = entry.category;
      title     = entry.title;
      content   = entry.content;
      language  = entry.language;
      role      = entry.role;
      isActive  = entry.isActive;
      createdAt = now;
      updatedAt = now;
    };
    knowledgeEntries.add(newEntry);
    #ok(newEntry);
  };

  // Eintrag aktualisieren (Platform Admin only)
  public shared ({ caller }) func updateKnowledgeEntry(
    id    : Text,
    entry : { category : Text; title : Text; content : Text; language : Text; role : Text; isActive : Bool },
  ) : async CommonTypes.Result<KbTypes.KnowledgeEntry> {
    if (not checkIsKbPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let now = Time.now();
    var found = false;
    var updated : ?KbTypes.KnowledgeEntry = null;
    knowledgeEntries.mapInPlace(
      func(e : KbTypes.KnowledgeEntry) : KbTypes.KnowledgeEntry {
        if (e.id == id) {
          found := true;
          let u : KbTypes.KnowledgeEntry = {
            e with
            category  = entry.category;
            title     = entry.title;
            content   = entry.content;
            language  = entry.language;
            role      = entry.role;
            isActive  = entry.isActive;
            updatedAt = now;
          };
          updated := ?u;
          u;
        } else { e };
      }
    );
    if (not found) {
      return #err("Eintrag nicht gefunden: " # id);
    };
    switch (updated) {
      case (?u) { #ok(u) };
      case null { #err("Interner Fehler beim Aktualisieren.") };
    };
  };

  // Eintrag löschen (Platform Admin only)
  public shared ({ caller }) func deleteKnowledgeEntry(id : Text) : async CommonTypes.Result<Bool> {
    if (not checkIsKbPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let before = knowledgeEntries.size();
    knowledgeEntries.retain(func(e : KbTypes.KnowledgeEntry) : Bool { e.id != id });
    let after = knowledgeEntries.size();
    if (before == after) {
      return #err("Eintrag nicht gefunden: " # id);
    };
    #ok(true);
  };

  // Relevante Einträge als Kontext-String für OpenAI zurückgeben
  // Gibt aktive Einträge zurück, begrenzt auf maxEntries, formatiert als lesbare Liste
  public query func getRelevantKnowledgeContext(queryText : Text, maxEntries : Nat) : async Text {
    let lowerQuery = queryText.toLower();
    let active = knowledgeEntries.filter(func(e : KbTypes.KnowledgeEntry) : Bool { e.isActive });
    // Einfache Keyword-Relevanz: Einträge die Suchwort im Titel oder Inhalt enthalten zuerst
    let matched = active.filter(
      func(e : KbTypes.KnowledgeEntry) : Bool {
        e.title.toLower().contains(#text lowerQuery) or
        e.content.toLower().contains(#text lowerQuery);
      }
    );
    // Dann alle anderen aktiven Einträge (für Kontext)
    let unmatched = active.filter(
      func(e : KbTypes.KnowledgeEntry) : Bool {
        not (e.title.toLower().contains(#text lowerQuery) or
          e.content.toLower().contains(#text lowerQuery));
      }
    );
    var context = "";
    var count = 0;
    // Zuerst relevante Einträge
    for (e in matched.values()) {
      if (count < maxEntries) {
        context := context # "[" # e.category # "] " # e.title # ": " # e.content # "\n\n";
        count += 1;
      };
    };
    // Dann weitere bis maxEntries aufgefüllt
    for (e in unmatched.values()) {
      if (count < maxEntries) {
        context := context # "[" # e.category # "] " # e.title # ": " # e.content # "\n\n";
        count += 1;
      };
    };
    context;
  };
};
