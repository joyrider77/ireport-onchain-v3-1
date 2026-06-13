// AI / OpenAI-Integration – iReport Onchain V3.1
// OpenAI API Key-Verwaltung (nur Platform Admin) und Chat-Assistent (alle authentifizierten Rollen)
import Text "mo:core/Text";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Outcall "mo:caffeineai-http-outcalls/outcall";

import CommonTypes "../types/common";
import CostDashboardTypes "../types/cost-dashboard";
import KbTypes "../types/knowledge-base";
import Error "mo:core/Error";

mixin (
  platformAdminPrincipal : { var value : ?Principal },
  openAIConfigState : { var value : ?CostDashboardTypes.OpenAIConfig },
  knowledgeEntries : List.List<KbTypes.KnowledgeEntry>,
) {
  // Wissensbasis-Kontext synchron aufbauen (direkt aus knowledgeEntries)
  private func buildKnowledgeContext(queryText : Text, maxEntries : Nat) : Text {
    let lowerQuery = queryText.toLower();
    let active = knowledgeEntries.filter(func(e : KbTypes.KnowledgeEntry) : Bool { e.isActive });
    let matched = active.filter(
      func(e : KbTypes.KnowledgeEntry) : Bool {
        e.title.toLower().contains(#text lowerQuery) or
        e.content.toLower().contains(#text lowerQuery);
      }
    );
    let unmatched = active.filter(
      func(e : KbTypes.KnowledgeEntry) : Bool {
        not (e.title.toLower().contains(#text lowerQuery) or
          e.content.toLower().contains(#text lowerQuery));
      }
    );
    var context = "";
    var count = 0;
    for (e in matched.values()) {
      if (count < maxEntries) {
        context := context # "[" # e.category # "] " # e.title # ": " # e.content # "\n\n";
        count += 1;
      };
    };
    for (e in unmatched.values()) {
      if (count < maxEntries) {
        context := context # "[" # e.category # "] " # e.title # ": " # e.content # "\n\n";
        count += 1;
      };
    };
    context;
  };

  // Hilfsfunktion: prüft ob der Caller Platform Admin ist
  private func checkIsAIPlatformAdmin(caller : Principal) : Bool {
    switch (platformAdminPrincipal.value) {
      case (?p) { Principal.equal(p, caller) };
      case null { false };
    };
  };

  // Transform-Funktion für HTTP-Outcalls (entfernt nicht-deterministische Header)
  public query func transformOpenAI(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  // ─── Platform-Admin-Funktionen ────────────────────────────────────────────────
  // OpenAI-Status für alle authentifizierten Nutzer (kein Admin-Check)
  public query func getOpenAIEnabled() : async { isConfigured : Bool } {
    {
      isConfigured = switch (openAIConfigState.value) {
        case null { false };
        case (?cfg) { cfg.apiKey != "" };
      };
    };
  };


  // OpenAI API Key hinterlegen (nur Platform Admin, Key wird sicher gespeichert)
  public shared ({ caller }) func setOpenAIConfig(apiKey : Text) : async CommonTypes.Result<()> {
    if (not checkIsAIPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    if (apiKey == "") {
      openAIConfigState.value := null;
    } else {
      openAIConfigState.value := ?{ apiKey };
    };
    #ok(());
  };

  // Status der OpenAI-Konfiguration abrufen (nur Platform Admin, Key wird NIEMALS zurückgegeben!)
  public query ({ caller }) func getOpenAIConfigStatus() : async { isConfigured : Bool } {
    if (not checkIsAIPlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    {
      isConfigured = switch (openAIConfigState.value) {
        case null { false };
        case (?cfg) { cfg.apiKey != "" };
      };
    };
  };

  // OpenAI-Verbindung testen (nur Platform Admin, macht echten HTTP-Outcall)
  public shared ({ caller }) func testOpenAIConnection() : async CommonTypes.Result<Text> {
    if (not checkIsAIPlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let apiKey = switch (openAIConfigState.value) {
      case null { return #err("Kein OpenAI API Key konfiguriert. Bitte zuerst einen API Key hinterlegen.") };
      case (?cfg) {
        if (cfg.apiKey == "") {
          return #err("Kein OpenAI API Key konfiguriert.");
        };
        cfg.apiKey;
      };
    };
    let testBody = "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":\"Antworte nur mit: OK\"}],\"max_tokens\":5}";
    let headers : [Outcall.Header] = [
      { name = "Authorization"; value = "Bearer " # apiKey },
      { name = "Content-Type"; value = "application/json" },
    ];
    try {
      let response = await Outcall.httpPostRequest(
        "https://api.openai.com/v1/chat/completions",
        headers,
        testBody,
        transformOpenAI,
      );
      if (response.contains(#text "choices")) {
        #ok("Verbindung erfolgreich. OpenAI API antwortet korrekt.");
      } else if (response.contains(#text "error")) {
        #err("OpenAI API Fehler: " # response);
      } else {
        #ok("Verbindung hergestellt. Antwort: " # response);
      };
    } catch (e) {
      #err("Verbindungsfehler: " # e.message());
    };
  };

  // ─── Chat-Assistent (für alle authentifizierten Rollen) ───────────────────────

  // Chat-Nachricht an OpenAI senden und Antwort zurückgeben
  // conversationHistory: vorherige Nachrichten [{role: "user"|"assistant", content: "..."}]
  public shared ({ caller }) func sendChatMessage(
    message : Text,
    conversationHistory : [{ role : Text; content : Text }],
  ) : async CommonTypes.Result<Text> {
    // Caller muss authentifiziert sein (kein anonymer Principal)
    if (caller.isAnonymous()) {
      return #err("Anmeldung erforderlich.");
    };
    let apiKey = switch (openAIConfigState.value) {
      case null { return #err("Chat-Assistent ist momentan nicht verfügbar. Bitte später erneut versuchen.") };
      case (?cfg) {
        if (cfg.apiKey == "") {
          return #err("Chat-Assistent ist momentan nicht verfügbar.");
        };
        cfg.apiKey;
      };
    };
    // Wissensbasis-Kontext synchron aufbauen (Top 12 relevante Einträge)
    let kbContext = buildKnowledgeContext(message, 12);
    // System-Prompt mit Wissensbasis-Kontext
    let basePrompt = "Du bist ein freundlicher Support-Assistent für iReport Onchain, eine HR- und Zeiterfassungs-App für Schweizer Unternehmen. Beantworte Fragen zur App, zu Zeiterfassung, Ferien, Spesen und HR-Prozessen. Erkenne die Sprache der Anfrage automatisch und antworte in derselben Sprache (Deutsch oder Englisch). Wenn eine Frage nicht durch dein Wissen abgedeckt ist, kommuniziere das transparent und verweise freundlich an den Support.";
    let systemPrompt = if (kbContext == "") {
      basePrompt;
    } else {
      basePrompt # "\n\nWissensbasis:\n" # kbContext;
    };
    // Nachrichten-Array als JSON aufbauen
    var messagesJson = "[{\"role\":\"system\",\"content\":\"" # escapeJson(systemPrompt) # "\"}";
    for (entry in conversationHistory.vals()) {
      messagesJson := messagesJson # ",{\"role\":\"" # escapeJson(entry.role) # "\",\"content\":\"" # escapeJson(entry.content) # "\"}";
    };
    messagesJson := messagesJson # ",{\"role\":\"user\",\"content\":\"" # escapeJson(message) # "\"}";
    messagesJson := messagesJson # "]";
    let requestBody = "{\"model\":\"gpt-4o-mini\",\"messages\":" # messagesJson # ",\"max_tokens\":1000,\"stream\":false}";
    let headers : [Outcall.Header] = [
      { name = "Authorization"; value = "Bearer " # apiKey },
      { name = "Content-Type"; value = "application/json" },
    ];
    try {
      let response = await Outcall.httpPostRequest(
        "https://api.openai.com/v1/chat/completions",
        headers,
        requestBody,
        transformOpenAI,
      );
      // Prüfe zuerst auf Fehlerantwort von OpenAI
      if (response.contains(#text "\"error\"") and not response.contains(#text "\"choices\"")) {
        let errMsg = extractErrorMessage(response);
        return #err("OpenAI Fehler: " # errMsg);
      };
      // Antwort-Text aus JSON extrahieren
      let extracted = extractChatContent(response);
      switch (extracted) {
        case (?content) {
          if (content == "") {
            #err("Leere Antwort vom Chat-Assistenten erhalten.")
          } else {
            #ok(content)
          }
        };
        case null {
          #err("Antwort konnte nicht verarbeitet werden. Bitte erneut versuchen.");
        };
      };
    } catch (e) {
      #err("Verbindungsfehler zum Chat-Assistenten: " # e.message());
    };
  };

  // Hilfsfunktion: JSON-Sonderzeichen escapen
  private func escapeJson(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      if (c == '\"') { result := result # "\\\"" }
      else if (c == '\\') { result := result # "\\\\" }
      else if (c == '\n') { result := result # "\\n" }
      else if (c == '\r') { result := result # "\\r" }
      else if (c == '\t') { result := result # "\\t" }
      else { result := result # Text.fromChar(c) };
    };
    result;
  };

  // Hilfsfunktion: content-Feld aus OpenAI-Antwort extrahieren
  // OpenAI-Antwort hat die Form: {..."choices":[{..."message":{"role":"assistant","content":"TEXT"}...}]...}
  private func extractChatContent(json : Text) : ?Text {
    // OpenAI-Antwortformat:
    // {"choices":[{"index":0,"message":{"role":"assistant","content":"TEXT"},"finish_reason":"stop"}],...}
    //
    // Strategie:
    // 1. Schneide den String ab dem ersten Vorkommen von "\"choices\":" ab.
    // 2. Suche in diesem Teilstring nach dem ersten Vorkommen von
    //    "\"content\":" (mit oder ohne Leerzeichen davor).
    // 3. Prüfe das nächste Nicht-Leerzeichen-Zeichen:
    //    - Wenn '"': extrahiere bis zum nächsten unescapten Anführungszeichen.
    //    - Wenn 'n' (null): gib leeren String zurück.
    //    - Sonst: gib null zurück.

    // Schritt 1: Schneide alles VOR "choices": ab
    let choicesMarker = "\"choices\":";
    let choicesParts = json.split(#text choicesMarker);
    var choicesPartsCount = 0;
    var afterChoices = "";
    for (part in choicesParts) {
      if (choicesPartsCount == 1) {
        afterChoices := part;
      } else if (choicesPartsCount > 1) {
        // Weitere Teile anhängen (falls choices-Marker mehrmals vorkommt)
        afterChoices := afterChoices # choicesMarker # part;
      };
      choicesPartsCount += 1;
    };
    if (choicesPartsCount < 2) {
      // Kein choices-Marker gefunden
      return null;
    };

    // Schritt 2: Suche nach "content": im afterChoices-String
    // Versuche zuerst "\"content\":\"" (ohne Leerzeichen)
    let contentMarker = "\"content\":";
    let contentParts = afterChoices.split(#text contentMarker);
    var contentPartsCount = 0;
    var afterContent = "";
    var foundContent = false;
    for (part in contentParts) {
      if (contentPartsCount == 1) {
        afterContent := part;
        foundContent := true;
      };
      contentPartsCount += 1;
    };
    if (not foundContent) {
      return null;
    };

    // Schritt 3: Überspringe optionale Leerzeichen nach dem Doppelpunkt
    var rest = afterContent;
    var firstNonSpace : ?Char = null;
    var firstNonSpaceIdx = 0;
    var idx = 0;
    label skipSpaces for (c in rest.chars()) {
      if (c == ' ' or c == '\t' or c == '\n' or c == '\r') {
        idx += 1;
      } else {
        firstNonSpace := ?c;
        firstNonSpaceIdx := idx;
        break skipSpaces;
      };
    };
    let startChar = switch (firstNonSpace) {
      case (?c) { c };
      case null { return null };
    };

    // Schritt 4: Wenn das nächste Zeichen '"' ist, extrahiere den String-Wert
    if (startChar == '\u{22}') {
      // Überspringe das öffnende Anführungszeichen und optional Leerzeichen
      // rest ist der String ab contentMarker; wir müssen firstNonSpaceIdx+1 Zeichen überspringen
      var skipCount = firstNonSpaceIdx + 1; // +1 für das öffnende "
      var valueStr = "";
      var skipped = 0;
      label extractValue for (c in rest.chars()) {
        if (skipped < skipCount) {
          skipped += 1;
        } else {
          valueStr := valueStr # Text.fromChar(c);
        };
      };
      // Extrahiere bis zum ersten unescapten Anführungszeichen
      let extracted = extractUntilUnescapedQuote(valueStr);
      if (extracted == "") {
        return ?"";
      };
      return ?extracted;
    } else if (startChar == 'n') {
      // null-Wert: leerer String
      return ?""
    } else {
      return null;
    };
  };

  // Hilfsfunktion: Fehlermeldung aus OpenAI-Fehlerantwort extrahieren
  private func extractErrorMessage(json : Text) : Text {
    let marker = "\"message\":\"";
    let parts = json.split(#text marker);
    var count = 0;
    label scan for (part in parts) {
      if (count >= 1) {
        return extractUntilUnescapedQuote(part);
      };
      count += 1;
    };
    json;
  };

  // Extrahiert Text bis zum ersten nicht-escapten Anführungszeichen
  private func extractUntilUnescapedQuote(s : Text) : Text {
    var result = "";
    var prevWasBackslash = false;
    label scan for (c in s.chars()) {
      let isQuote = c == '\u{22}';
      if (isQuote and not prevWasBackslash) {
        break scan;
      };
      if (c == '\\' and not prevWasBackslash) {
        prevWasBackslash := true;
        result := result # Text.fromChar(c);
      } else {
        prevWasBackslash := false;
        result := result # Text.fromChar(c);
      };
    };
    result;
  };
};
