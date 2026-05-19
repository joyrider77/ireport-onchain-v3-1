// Stripe-Zahlungsintegration API – iReport Onchain V3.1
// Internet Computer HTTP Outcalls → Stripe REST API
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";


import CommonTypes "../types/common";
import CostDashboardTypes "../types/cost-dashboard";
import CompanyTypes "../types/company";
import Blob "mo:core/Blob";

mixin (
  platformAdminPrincipal    : { var value : ?Principal },
  principalToCompany        : Map.Map<Principal, CommonTypes.CompanyId>,
  companies                 : List.List<CompanyTypes.Company>,
  employees                 : List.List<CompanyTypes.Employee>,
  stripeEvents              : Map.Map<Text, CostDashboardTypes.StripeEvent>,
  stripeInvoices            : Map.Map<Text, CostDashboardTypes.StripeInvoice>,
  stripeCheckoutSessions    : Map.Map<Text, CostDashboardTypes.StripeCheckoutSession>,
  nextStripeEventId         : { var value : Nat },
  nextStripeInvoiceId       : { var value : Nat },
  nextStripeSessionId       : { var value : Nat },
  companySubscriptionDetailsV3 : Map.Map<Text, CostDashboardTypes.CompanySubscription>,
  subscriptionPlansV3       : Map.Map<Text, CostDashboardTypes.SubscriptionPlan>,
  stripeConfigState         : { var value : ?CostDashboardTypes.StripeConfig },
) {

  type HttpHeader = { name : Text; value : Text };
  type HttpTransformArgs = { response : HttpRequestResult; context : Blob };
  type HttpRequestArgs = {
    url                : Text;
    max_response_bytes : ?Nat64;
    headers            : [HttpHeader];
    body               : ?Blob;
    method             : { #get; #post; #head };
    transform          : ?{
      function : shared query HttpTransformArgs -> async HttpRequestResult;
      context  : Blob;
    };
  };
  type HttpRequestResult = {
    status  : Nat;
    headers : [HttpHeader];
    body    : Blob;
  };

  // Deterministische Transform-Funktion für Stripe HTTP-Outcalls.
  // Gibt nur den Body zurück und entfernt alle Header, die zwischen Replicas
  // variieren können (Timestamps, Request-IDs usw.) → Konsens möglich.
  public query func transformStripeResponse(args : HttpTransformArgs) : async HttpRequestResult {
    { args.response with headers = [] };
  };

  type ManagementCanister = actor {
    http_request : shared (HttpRequestArgs) -> async HttpRequestResult;
  };
  let IC : ManagementCanister = actor "aaaaa-aa";

  type StripeConfig = CostDashboardTypes.StripeConfig;

  private func checkIsStripePlatformAdmin(caller : Principal) : Bool {
    switch (platformAdminPrincipal.value) {
      case (?p) { Principal.equal(p, caller) };
      case null { false };
    };
  };

  private func isCompanyAdminOrManager(caller : Principal, companyId : CommonTypes.CompanyId) : Bool {
    if (checkIsStripePlatformAdmin(caller)) return true;
    switch (principalToCompany.get(caller)) {
      case null { false };
      case (?cid) {
        if (cid != companyId) return false;
        switch (employees.find(func(e) { e.principalId == ?caller and e.companyId == cid and e.active })) {
          case null { false };
          case (?e) { e.role == #admin or e.role == #manager };
        };
      };
    };
  };

  private func getOrDefaultSubscription(companyId : Nat) : CostDashboardTypes.CompanySubscription {
    let key = companyId.toText();
    switch (companySubscriptionDetailsV3.get(key)) {
      case (?sub) sub;
      case null {
        {
          companyId;
          planId                       = "basis";
          billingModel                 = #monthly;
          subscriptionStartDate        = null;
          proRataAmount                = null;
          proRataNote                  = null;
          proRataCalculatedAt          = null;
          nextDueDate                  = null;
          stripeCustomerId             = null;
          stripeSubscriptionId         = null;
          stripeProductId              = null;
          stripeStatus                 = null;
          stripeCurrentPeriodStart     = null;
          stripeCurrentPeriodEnd       = null;
          stripeCancelAtPeriodEnd      = false;
          latestStripeInvoiceId        = null;
          latestStripePaymentStatus    = null;
          lastStripeSyncAt             = null;
          scheduledPlanChangeId        = null;
          scheduledPlanChangePriceId   = null;
          scheduledPlanChangeEffectiveAt = null;
        };
      };
    };
  };

  private func saveSubscription(sub : CostDashboardTypes.CompanySubscription) {
    companySubscriptionDetailsV3.add(sub.companyId.toText(), sub);
  };

  private func getCompanyInfo(companyId : Nat) : (Text, Text) {
    let company = switch (companies.find(func(c) { c.id == companyId })) {
      case (?c) c;
      case null { Runtime.trap("Firma nicht gefunden: " # companyId.toText()) };
    };
    let adminEmployee = employees.find(func(e) {
      e.companyId == companyId and e.active and e.role == #admin
    });
    let adminEmail = switch (adminEmployee) {
      case (?e) e.email;
      case null "";
    };
    (company.name, adminEmail);
  };

  private func nextEventId() : Text {
    nextStripeEventId.value += 1;
    "SE-" # nextStripeEventId.value.toText();
  };

  private func nextInvoiceIdLocal() : Text {
    nextStripeInvoiceId.value += 1;
    "SI-" # nextStripeInvoiceId.value.toText();
  };

  private func nextSessionId() : Text {
    nextStripeSessionId.value += 1;
    "SS-" # nextStripeSessionId.value.toText();
  };

  private func mapStripeStatusToInternal(stripeStatus : Text) : Text {
    switch (stripeStatus) {
      case "active"             { "active" };
      case "past_due"           { "past_due" };
      case "unpaid"             { "suspended" };
      case "canceled"           { "cancelled" };
      case "incomplete"         { "pending_payment" };
      case "incomplete_expired" { "expired" };
      case "trialing"           { "active" };
      case "paused"             { "suspended" };
      case _                    { stripeStatus };
    };
  };

  private func getStripeSecretKey() : Text {
    switch (stripeConfigState.value) {
      case null "";
      case (?cfg) cfg.secretKey;
    };
  };

  private func getStripePublishableKeyInternal() : ?Text {
    switch (stripeConfigState.value) {
      case null null;
      case (?cfg) { if (cfg.publishableKey == "") null else ?cfg.publishableKey };
    };
  };

  private func stripePost(path : Text, formBody : Text, secretKey : Text) : async (Nat, Text) {
    await stripePostWithKey(path, formBody, secretKey, path);
  };

  // Stripe POST mit explizitem Idempotency-Key.
  // Für Customer-Creation: stabiler Key pro companyId, unabhängig von Zeit oder Replica.
  // Für alle anderen Aufrufe: Pfad als Key (bestehend).
  private func stripePostWithKey(path : Text, formBody : Text, secretKey : Text, idempotencyKey : Text) : async (Nat, Text) {
    let url = "https://api.stripe.com" # path;
    let response = await (with cycles = 800_000_000) IC.http_request({
      url;
      max_response_bytes = ?(65536 : Nat64);
      headers = [
        { name = "Authorization"; value = "Bearer " # secretKey },
        { name = "Content-Type"; value = "application/x-www-form-urlencoded" },
        { name = "Stripe-Version"; value = "2024-04-10" },
        { name = "Idempotency-Key"; value = idempotencyKey },
      ];
      body = ?formBody.encodeUtf8();
      method = #post;
      transform = ?{ function = transformStripeResponse; context = Blob.fromArray([]) };
    });
    (response.status, switch (response.body.decodeUtf8()) { case (?t) t; case null "" });
  };

  private func stripeGet(path : Text, secretKey : Text) : async (Nat, Text) {
    let url = "https://api.stripe.com" # path;
    let response = await (with cycles = 800_000_000) IC.http_request({
      url;
      max_response_bytes = ?(65536 : Nat64);
      headers = [
        { name = "Authorization"; value = "Bearer " # secretKey },
        { name = "Stripe-Version"; value = "2024-04-10" },
      ];
      body = null;
      method = #get;
      transform = ?{ function = transformStripeResponse; context = Blob.fromArray([]) };
    });
    (response.status, switch (response.body.decodeUtf8()) { case (?t) t; case null "" });
  };

  private func urlEncode(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      result #= switch (c) {
        case ' '  "%20";
        case '&'  "%26";
        case '='  "%3D";
        case '+'  "%2B";
        case '#'  "%23";
        case '%'  "%25";
        case '?'  "%3F";
        case '/'  "%2F";
        case _    Text.fromChar(c);
      };
    };
    result;
  };

  private func isStripeError(json : Text) : Bool {
    json.contains(#text("\"error\""));
  };

  private func extractJsonString(json : Text, key : Text) : ?Text {
    let needle = "\"" # key # "\"";
    let iter = json.split(#text(needle));
    ignore iter.next();
    switch (iter.next()) {
      case null null;
      case (?after) {
        let dq = #text("\"");
        let parts = after.split(dq);
        ignore parts.next();
        switch (parts.next()) {
          case null null;
          case (?val) ?val;
        };
      };
    };
  };

  private func extractJsonBool(json : Text, key : Text) : ?Bool {
    let needle = "\"" # key # "\"";
    let iter = json.split(#text(needle));
    ignore iter.next();
    switch (iter.next()) {
      case null null;
      case (?after) {
        let trimmed = after.trimStart(#predicate(func(c) { c == ':' or c == ' ' }));
        if (trimmed.startsWith(#text("true"))) ?true
        else if (trimmed.startsWith(#text("false"))) ?false
        else null;
      };
    };
  };

  private func extractJsonInt(json : Text, key : Text) : ?Int {
    let needle = "\"" # key # "\"";
    let iter = json.split(#text(needle));
    ignore iter.next();
    switch (iter.next()) {
      case null null;
      case (?after) {
        let trimmed = after.trimStart(#predicate(func(c) { c == ':' or c == ' ' }));
        var numStr = "";
        var started = false;
        var negative = false;
        label numLoop for (c in trimmed.chars()) {
          if (not started) {
            if (c == '-') { negative := true; started := true }
            else if (c >= '0' and c <= '9') { numStr #= Text.fromChar(c); started := true };
          } else if (c >= '0' and c <= '9') {
            numStr #= Text.fromChar(c);
          } else break numLoop;
        };
        switch (Nat.fromText(numStr)) {
          case null null;
          case (?n) {
            let asInt : Int = n.toInt();
            if (negative) ?(0 - asInt)
            else ?asInt;
          };
        };
      };
    };
  };

  private func createOrGetStripeCustomer(
    companyId : Nat,
    secretKey : Text,
  ) : async CommonTypes.Result<Text> {
    // Re-read subscription at every decision point to catch concurrent writes.
    switch (getOrDefaultSubscription(companyId).stripeCustomerId) {
      case (?cid) { return #ok(cid) };
      case null {};
    };
    let (companyName, adminEmail) = getCompanyInfo(companyId);
    let body =
      "name=" # urlEncode(companyName) #
      "&email=" # urlEncode(adminEmail) #
      "&metadata[tenantId]=" # companyId.toText();
    // Stable, per-company idempotency key — all 13 ICP replicas use the same key,
    // so Stripe deduplicates the request and returns the same customer for all of them.
    let idempotencyKey = "create_customer_company_" # companyId.toText();
    let (status, responseBody) = await stripePostWithKey("/v1/customers", body, secretKey, idempotencyKey);
    if (status >= 400 or isStripeError(responseBody)) {
      return #err("Stripe Customer-Erstellung fehlgeschlagen (" # status.toText() # "): " # responseBody);
    };
    switch (extractJsonString(responseBody, "id")) {
      case null { #err("Stripe: Keine Customer-ID in Antwort") };
      case (?newCustomerId) {
        // Post-creation deduplication: another replica may have written a customerId
        // between our initial check and now.  Prefer the already-stored value.
        let finalCustomerId = switch (getOrDefaultSubscription(companyId).stripeCustomerId) {
          case (?alreadyStored) alreadyStored;
          case null newCustomerId;
        };
        saveSubscription({ getOrDefaultSubscription(companyId) with
          stripeCustomerId = ?finalCustomerId;
          lastStripeSyncAt = ?Time.now();
        });
        #ok(finalCustomerId);
      };
    };
  };

  private func findCompanyByStripeIds(
    stripeCustomerId     : ?Text,
    stripeSubscriptionId : ?Text,
  ) : ?Nat {
    switch (stripeSubscriptionId) {
      case (?subId) {
        let found = companySubscriptionDetailsV3.entries().find(func((_, sub)) {
          sub.stripeSubscriptionId == ?subId
        });
        switch (found) {
          case (?(_, sub)) { return ?sub.companyId };
          case null {};
        };
      };
      case null {};
    };
    switch (stripeCustomerId) {
      case (?custId) {
        let found = companySubscriptionDetailsV3.entries().find(func((_, sub)) {
          sub.stripeCustomerId == ?custId
        });
        switch (found) {
          case (?(_, sub)) { return ?sub.companyId };
          case null {};
        };
      };
      case null {};
    };
    null;
  };

  private func doCreateCheckoutSession(
    companyId    : Nat,
    planId       : Text,
    billingModel : CostDashboardTypes.BillingModel,
    priceId      : Text,
  ) : async CommonTypes.Result<{ url : Text; sessionId : Text }> {
    let secretKey = getStripeSecretKey();
    if (secretKey == "") return #err("Stripe Secret Key nicht konfiguriert");
    let customerId = switch (await createOrGetStripeCustomer(companyId, secretKey)) {
      case (#err(e)) { return #err(e) };
      case (#ok(cid)) cid;
    };
    let billingModelText = switch (billingModel) { case (#monthly) "monthly"; case (#yearly) "yearly" };
    let body =
      "mode=subscription" #
      "&customer=" # urlEncode(customerId) #
      "&line_items[0][price]=" # urlEncode(priceId) #
      "&line_items[0][quantity]=1" #
      "&success_url=" # urlEncode("https://strategic-cyan-kjv-draft.caffeine.xyz/abo/success?session_id={CHECKOUT_SESSION_ID}") #
      "&cancel_url=" # urlEncode("https://strategic-cyan-kjv-draft.caffeine.xyz/abo/cancel") #
      "&metadata[tenantId]=" # companyId.toText() #
      "&metadata[planId]=" # urlEncode(planId) #
      "&metadata[billingModel]=" # urlEncode(billingModelText) #
      "&client_reference_id=" # companyId.toText();
    let (status, responseBody) = await stripePost("/v1/checkout/sessions", body, secretKey);
    if (status >= 400 or isStripeError(responseBody)) {
      return #err("Stripe Checkout-Session fehlgeschlagen (" # status.toText() # "): " # responseBody);
    };
    let checkoutUrl = switch (extractJsonString(responseBody, "url")) {
      case null { return #err("Stripe: Keine URL in Antwort") };
      case (?u) u;
    };
    let stripeSessionId = switch (extractJsonString(responseBody, "id")) {
      case null { return #err("Stripe: Keine Session-ID in Antwort") };
      case (?sid) sid;
    };
    let sessionRecord : CostDashboardTypes.StripeCheckoutSession = {
      id               = nextSessionId();
      companyId;
      stripeSessionId;
      stripePriceId    = priceId;
      planId;
      billingModel;
      createdAt        = Time.now();
      expiresAt        = ?(Time.now() + 86_400_000_000_000);
      status           = "open";
      stripeCustomerId = ?customerId;
    };
    stripeCheckoutSessions.add(stripeSessionId, sessionRecord);
    #ok({ url = checkoutUrl; sessionId = stripeSessionId });
  };

  private func processStripeEvent(
    eventType  : Text,
    payload    : Text,
  ) : async CommonTypes.Result<Text> {
    switch (eventType) {
      case "checkout.session.completed" { await handleCheckoutSessionCompleted(payload) };
      case "customer.subscription.created" { await handleSubscriptionCreatedOrUpdated(payload, false) };
      case "customer.subscription.updated" { await handleSubscriptionCreatedOrUpdated(payload, true) };
      case "customer.subscription.deleted" { await handleSubscriptionDeleted(payload) };
      case "invoice.paid" { await handleInvoicePaymentSucceeded(payload) };
      case "invoice.payment_succeeded" { await handleInvoicePaymentSucceeded(payload) };
      case "invoice.payment_failed" { await handleInvoicePaymentFailed(payload) };
      case "invoice.finalized" { await handleInvoiceFinalized(payload) };
      case _ { #ok("Event ignoriert: " # eventType) };
    };
  };

  private func handleCheckoutSessionCompleted(payload : Text) : async CommonTypes.Result<Text> {
    let sessionId = switch (extractJsonString(payload, "id")) {
      case null { return #err("checkout.session.completed: Keine Session-ID") };
      case (?id) id;
    };
    let tenantIdText = switch (extractJsonString(payload, "client_reference_id")) {
      case null { return #err("checkout.session.completed: Keine tenantId") };
      case (?t) t;
    };
    let companyId = switch (Nat.fromText(tenantIdText)) {
      case null { return #err("checkout.session.completed: Ungueltige tenantId") };
      case (?n) n;
    };
    let stripeSubscriptionId = extractJsonString(payload, "subscription");
    let stripeCustomerId = extractJsonString(payload, "customer");
    switch (stripeCheckoutSessions.get(sessionId)) {
      case (?sess) { stripeCheckoutSessions.add(sessionId, { sess with status = "complete" }) };
      case null {};
    };
    let sub = getOrDefaultSubscription(companyId);
    saveSubscription({
      sub with
      stripeSubscriptionId = switch (stripeSubscriptionId) { case (?s) ?s; case null sub.stripeSubscriptionId };
      stripeCustomerId     = switch (stripeCustomerId) { case (?c) ?c; case null sub.stripeCustomerId };
      stripeStatus         = ?"active";
      lastStripeSyncAt     = ?Time.now();
    });
    #ok("checkout.session.completed verarbeitet");
  };

  private func handleSubscriptionCreatedOrUpdated(payload : Text, isUpdate : Bool) : async CommonTypes.Result<Text> {
    let stripeSubId = switch (extractJsonString(payload, "id")) {
      case null { return #err("subscription event: Keine Subscription-ID") };
      case (?id) id;
    };
    let stripeCustomerId = extractJsonString(payload, "customer");
    let stripeStatus = switch (extractJsonString(payload, "status")) {
      case null "active";
      case (?s) s;
    };
    let cancelAtPeriodEnd = switch (extractJsonBool(payload, "cancel_at_period_end")) {
      case (?b) b;
      case null false;
    };
    let periodStart = extractJsonInt(payload, "current_period_start");
    let periodEnd   = extractJsonInt(payload, "current_period_end");
    switch (findCompanyByStripeIds(stripeCustomerId, ?stripeSubId)) {
      case null { return #err("subscription event: Kein Mandant gefunden") };
      case (?cid) {
        let sub = getOrDefaultSubscription(cid);
        saveSubscription({
          sub with
          stripeSubscriptionId     = ?stripeSubId;
          stripeCustomerId         = switch (stripeCustomerId) { case (?c) ?c; case null sub.stripeCustomerId };
          stripeStatus             = ?stripeStatus;
          stripeCurrentPeriodStart = periodStart;
          stripeCurrentPeriodEnd   = periodEnd;
          stripeCancelAtPeriodEnd  = cancelAtPeriodEnd;
          lastStripeSyncAt         = ?Time.now();
        });
        let action = if (isUpdate) "aktualisiert" else "erstellt";
        #ok("Subscription " # action # " fuer Mandant " # cid.toText());
      };
    };
  };

  private func handleSubscriptionDeleted(payload : Text) : async CommonTypes.Result<Text> {
    let stripeSubId = switch (extractJsonString(payload, "id")) {
      case null { return #err("subscription.deleted: Keine Subscription-ID") };
      case (?id) id;
    };
    let stripeCustomerId = extractJsonString(payload, "customer");
    switch (findCompanyByStripeIds(stripeCustomerId, ?stripeSubId)) {
      case null { return #ok("subscription.deleted: Kein Mandant gefunden - ignoriert") };
      case (?cid) {
        let sub = getOrDefaultSubscription(cid);
        saveSubscription({
          sub with
          stripeStatus            = ?"canceled";
          stripeCancelAtPeriodEnd = false;
          lastStripeSyncAt        = ?Time.now();
        });
        #ok("Subscription als cancelled markiert fuer Mandant " # cid.toText());
      };
    };
  };

  private func handleInvoicePaymentSucceeded(payload : Text) : async CommonTypes.Result<Text> {
    let invoiceId = switch (extractJsonString(payload, "id")) {
      case null { return #err("invoice.paid: Keine Invoice-ID") };
      case (?id) id;
    };
    let stripeCustomerId = extractJsonString(payload, "customer");
    let stripeSubId = extractJsonString(payload, "subscription");
    switch (findCompanyByStripeIds(stripeCustomerId, stripeSubId)) {
      case null { return #ok("invoice.paid: Kein Mandant - ignoriert") };
      case (?cid) {
        let sub = getOrDefaultSubscription(cid);
        saveSubscription({
          sub with
          stripeStatus              = ?"active";
          latestStripeInvoiceId     = ?invoiceId;
          latestStripePaymentStatus = ?"paid";
          lastStripeSyncAt          = ?Time.now();
        });
        switch (stripeInvoices.get(invoiceId)) {
          case (?inv) { stripeInvoices.add(invoiceId, { inv with status = "paid"; paidAt = ?Time.now() }) };
          case null {};
        };
        #ok("Zahlung erfolgreich fuer Mandant " # cid.toText());
      };
    };
  };

  private func handleInvoicePaymentFailed(payload : Text) : async CommonTypes.Result<Text> {
    let invoiceId = switch (extractJsonString(payload, "id")) {
      case null { return #err("invoice.payment_failed: Keine Invoice-ID") };
      case (?id) id;
    };
    let stripeCustomerId = extractJsonString(payload, "customer");
    let stripeSubId = extractJsonString(payload, "subscription");
    switch (findCompanyByStripeIds(stripeCustomerId, stripeSubId)) {
      case null { return #ok("invoice.payment_failed: Kein Mandant - ignoriert") };
      case (?cid) {
        let sub = getOrDefaultSubscription(cid);
        saveSubscription({
          sub with
          stripeStatus              = ?"past_due";
          latestStripeInvoiceId     = ?invoiceId;
          latestStripePaymentStatus = ?"failed";
          lastStripeSyncAt          = ?Time.now();
        });
        #ok("Zahlungsausfall verarbeitet fuer Mandant " # cid.toText());
      };
    };
  };

  private func handleInvoiceFinalized(payload : Text) : async CommonTypes.Result<Text> {
    let invoiceId = switch (extractJsonString(payload, "id")) {
      case null { return #err("invoice.finalized: Keine Invoice-ID") };
      case (?id) id;
    };
    let stripeCustomerId = switch (extractJsonString(payload, "customer")) {
      case null { return #err("invoice.finalized: Kein Customer") };
      case (?c) c;
    };
    let stripeSubId = extractJsonString(payload, "subscription");
    let companyIdOpt = findCompanyByStripeIds(?stripeCustomerId, stripeSubId);
    let cid = switch (companyIdOpt) { case null 0; case (?c) c };
    let amountDue : Float = switch (extractJsonInt(payload, "amount_due")) {
      case (?n) n.toFloat() / 100.0;
      case null 0.0;
    };
    let amountPaid : Float = switch (extractJsonInt(payload, "amount_paid")) {
      case (?n) n.toFloat() / 100.0;
      case null 0.0;
    };
    let issuedAt : Int = switch (extractJsonInt(payload, "created")) {
      case (?t) t * 1_000_000_000;
      case null Time.now();
    };
    let invoice : CostDashboardTypes.StripeInvoice = {
      id                   = nextInvoiceIdLocal();
      companyId            = cid;
      stripeInvoiceId      = invoiceId;
      stripeCustomerId;
      stripeSubscriptionId = stripeSubId;
      invoiceNumber        = extractJsonString(payload, "number");
      amountDue;
      amountPaid;
      currency             = switch (extractJsonString(payload, "currency")) { case null "chf"; case (?c) c };
      status               = switch (extractJsonString(payload, "status")) { case null "open"; case (?s) s };
      hostedInvoiceUrl     = extractJsonString(payload, "hosted_invoice_url");
      invoicePdfUrl        = extractJsonString(payload, "invoice_pdf");
      periodStart          = null;
      periodEnd            = null;
      dueDate              = switch (extractJsonInt(payload, "due_date")) {
        case (?t) ?(t * 1_000_000_000);
        case null null;
      };
      issuedAt;
      paidAt = null;
    };
    stripeInvoices.add(invoiceId, invoice);
    switch (companyIdOpt) {
      case (?cid2) {
        let sub = getOrDefaultSubscription(cid2);
        saveSubscription({ sub with latestStripeInvoiceId = ?invoiceId; lastStripeSyncAt = ?Time.now() });
      };
      case null {};
    };
    #ok("Rechnung gespeichert: " # invoiceId);
  };

  private func doSyncStripeSubscription(
    companyId : Nat
  ) : async CommonTypes.Result<CostDashboardTypes.CompanySubscription> {
    let secretKey = getStripeSecretKey();
    if (secretKey == "") return #err("Stripe Secret Key nicht konfiguriert");
    let sub = getOrDefaultSubscription(companyId);
    let stripeSubId = switch (sub.stripeSubscriptionId) {
      case null { return #ok(sub) };
      case (?id) id;
    };
    let (status, responseBody) = await stripeGet("/v1/subscriptions/" # stripeSubId, secretKey);
    if (status >= 400 or isStripeError(responseBody)) {
      return #err("Stripe Sync fehlgeschlagen (" # status.toText() # "): " # responseBody);
    };
    let stripeStatus = switch (extractJsonString(responseBody, "status")) {
      case null "active";
      case (?s) s;
    };
    let updated = {
      sub with
      stripeStatus             = ?stripeStatus;
      stripeCurrentPeriodStart = extractJsonInt(responseBody, "current_period_start");
      stripeCurrentPeriodEnd   = extractJsonInt(responseBody, "current_period_end");
      stripeCancelAtPeriodEnd  = switch (extractJsonBool(responseBody, "cancel_at_period_end")) {
        case (?b) b; case null false;
      };
      lastStripeSyncAt = ?Time.now();
    };
    saveSubscription(updated);
    #ok(updated);
  };

  public shared ({ caller }) func setStripeConfig(
    secretKey      : Text,
    publishableKey : Text,
    webhookSecret  : Text,
  ) : async CommonTypes.Result<Text> {
    if (not checkIsStripePlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    stripeConfigState.value := ?{ secretKey; publishableKey; webhookSecret };
    #ok("Stripe-Konfiguration gespeichert");
  };

  public query ({ caller }) func getStripeConfigStatus() : async {
    configured        : Bool;
    testMode          : Bool;
    hasPublishableKey : Bool;
  } {
    if (not checkIsStripePlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    switch (stripeConfigState.value) {
      case null { { configured = false; testMode = false; hasPublishableKey = false } };
      case (?cfg) {
        {
          configured        = true;
          testMode          = cfg.secretKey.startsWith(#text("sk_test_"));
          hasPublishableKey = cfg.publishableKey != "";
        }
      };
    };
  };

  public query ({ caller }) func getStripePublishableKey() : async ?Text {
    if (not checkIsStripePlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    getStripePublishableKeyInternal();
  };

  public shared ({ caller }) func createStripeCheckoutSession(
    companyId    : Nat,
    planId       : Text,
    billingModel : CostDashboardTypes.BillingModel,
  ) : async CommonTypes.Result<{ url : Text; sessionId : Text }> {
    if (not isCompanyAdminOrManager(caller, companyId)) {
      return #err("Keine Berechtigung: nur Admin oder Manager des Mandanten");
    };
    let secretKey = getStripeSecretKey();
    if (secretKey == "") return #err("Stripe Secret Key nicht konfiguriert");
    let plan = switch (subscriptionPlansV3.get(planId)) {
      case null { return #err("Plan nicht gefunden: " # planId) };
      case (?p) p;
    };
    if (not plan.requiresPayment) {
      return #err("Kostenloser Plan benoetigt keinen Checkout");
    };
    let priceId : Text = switch (billingModel) {
      case (#monthly) {
        switch (plan.stripePriceId) {
          case null { return #err("Plan hat keine Stripe Price ID (monatlich)") };
          case (?pid) pid;
        };
      };
      case (#yearly) {
        switch (plan.stripePriceIdYearly) {
          case null {
            switch (plan.stripePriceId) {
              case null { return #err("Plan hat keine Stripe Price ID") };
              case (?pid) pid;
            };
          };
          case (?pid) pid;
        };
      };
    };
    await doCreateCheckoutSession(companyId, planId, billingModel, priceId);
  };

  public shared ({ caller }) func createStripeCheckoutSessionWithPrice(
    companyId    : Nat,
    planId       : Text,
    billingModel : CostDashboardTypes.BillingModel,
    priceId      : Text,
  ) : async CommonTypes.Result<{ url : Text; sessionId : Text }> {
    if (not isCompanyAdminOrManager(caller, companyId)) {
      return #err("Keine Berechtigung: nur Admin oder Manager des Mandanten");
    };
    if (priceId == "") return #err("priceId darf nicht leer sein");
    await doCreateCheckoutSession(companyId, planId, billingModel, priceId);
  };

  public shared func handleStripeWebhook(
    payload   : Text,
    signature : Text,
  ) : async CommonTypes.Result<Text> {
    let _sig = signature;
    let eventType = switch (extractJsonString(payload, "type")) {
      case null { return #err("Webhook: Kein Event-Typ gefunden") };
      case (?t) t;
    };
    let stripeEventId = switch (extractJsonString(payload, "id")) {
      case null { return #err("Webhook: Keine Event-ID gefunden") };
      case (?id) id;
    };
    switch (stripeEvents.get(stripeEventId)) {
      case (?ev) {
        if (ev.processingStatus == #processed) {
          return #ok("Event bereits verarbeitet: " # stripeEventId);
        };
      };
      case null {};
    };
    let localId = nextEventId();
    let tenantId : ?Nat = switch (extractJsonString(payload, "client_reference_id")) {
      case null null;
      case (?t) Nat.fromText(t);
    };
    let eventRecord : CostDashboardTypes.StripeEvent = {
      id                   = localId;
      stripeEventId;
      eventType;
      receivedAt           = Time.now();
      processedAt          = null;
      processingStatus     = #received;
      tenantId;
      subscriptionId       = null;
      stripeCustomerId     = extractJsonString(payload, "customer");
      stripeSubscriptionId = extractJsonString(payload, "subscription");
      errorMessage         = null;
      rawPayload           = ?payload;
    };
    stripeEvents.add(stripeEventId, eventRecord);
    let processResult = await processStripeEvent(eventType, payload);
    let (finalStatus, errorMsg) = switch (processResult) {
      case (#ok(_))  { (#processed, null) };
      case (#err(e)) { (#failed, ?e) };
    };
    stripeEvents.add(stripeEventId, {
      eventRecord with
      processedAt      = ?Time.now();
      processingStatus = finalStatus;
      errorMessage     = errorMsg;
    });
    switch (processResult) {
      case (#ok(_))  { #ok("Webhook verarbeitet: " # eventType) };
      case (#err(e)) { #err("Webhook-Verarbeitung fehlgeschlagen: " # e) };
    };
  };

    public shared ({ caller }) func updateStripeSubscriptionQuantity(
    companyId   : Nat,
    newQuantity : Nat,
  ) : async CommonTypes.Result<()> {
    if (not isCompanyAdminOrManager(caller, companyId)) {
      return #err("Keine Berechtigung: nur Admin oder Manager des Mandanten");
    };
    let secretKey = getStripeSecretKey();
    if (secretKey == "") return #err("Stripe Secret Key nicht konfiguriert");
    let sub = getOrDefaultSubscription(companyId);
    let stripeSubId = switch (sub.stripeSubscriptionId) {
      case null { return #err("Kein aktives Stripe-Abonnement fuer diesen Mandanten") };
      case (?id) id;
    };
    let body =
      "quantity=" # newQuantity.toText() #
      "&proration_behavior=create_prorations";
    let (status, responseBody) = await stripePost(
      "/v1/subscriptions/" # stripeSubId,
      body,
      secretKey
    );
    if (status >= 400 or isStripeError(responseBody)) {
      return #err("Stripe Quantity-Update fehlgeschlagen (" # status.toText() # "): " # responseBody);
    };
    saveSubscription({ getOrDefaultSubscription(companyId) with lastStripeSyncAt = ?Time.now() });
    #ok(());
  };

public query ({ caller }) func getStripeInvoicesForCompany(
    companyId : Nat
  ) : async [CostDashboardTypes.StripeInvoice] {
    if (not isCompanyAdminOrManager(caller, companyId)) {
      Runtime.trap("Keine Berechtigung");
    };
    stripeInvoices.values().toArray().filter(func(inv) { inv.companyId == companyId });
  };

  public shared ({ caller }) func syncStripeSubscription(
    companyId : Nat
  ) : async CommonTypes.Result<CostDashboardTypes.CompanySubscription> {
    if (not isCompanyAdminOrManager(caller, companyId)) {
      return #err("Keine Berechtigung");
    };
    await doSyncStripeSubscription(companyId);
  };

  public shared ({ caller }) func createStripeCustomerPortalSession(
    companyId : Nat
  ) : async CommonTypes.Result<{ url : Text }> {
    if (not isCompanyAdminOrManager(caller, companyId)) {
      return #err("Keine Berechtigung");
    };
    let secretKey = getStripeSecretKey();
    if (secretKey == "") return #err("Stripe Secret Key nicht konfiguriert");
    let sub = getOrDefaultSubscription(companyId);
    let customerId = switch (sub.stripeCustomerId) {
      case null { return #err("Kein Stripe Customer fuer diesen Mandanten") };
      case (?cid) cid;
    };
    let body =
      "customer=" # urlEncode(customerId) #
      "&return_url=" # urlEncode("https://strategic-cyan-kjv-draft.caffeine.xyz/abo");
    let (status, responseBody) = await stripePost("/v1/billing_portal/sessions", body, secretKey);
    if (status >= 400 or isStripeError(responseBody)) {
      return #err("Customer Portal fehlgeschlagen (" # status.toText() # "): " # responseBody);
    };
    switch (extractJsonString(responseBody, "url")) {
      case null { #err("Stripe: Keine Portal-URL in Antwort") };
      case (?url) { #ok({ url }) };
    };
  };

  public shared ({ caller }) func cancelStripeSubscription(
    companyId : Nat
  ) : async CommonTypes.Result<CostDashboardTypes.CompanySubscription> {
    if (not isCompanyAdminOrManager(caller, companyId)) {
      return #err("Keine Berechtigung");
    };
    let secretKey = getStripeSecretKey();
    if (secretKey == "") return #err("Stripe Secret Key nicht konfiguriert");
    let sub = getOrDefaultSubscription(companyId);
    let stripeSubId = switch (sub.stripeSubscriptionId) {
      case null { return #err("Kein aktives Stripe-Abonnement") };
      case (?id) id;
    };
    let (status, responseBody) = await stripePost(
      "/v1/subscriptions/" # stripeSubId,
      "cancel_at_period_end=true",
      secretKey
    );
    if (status >= 400 or isStripeError(responseBody)) {
      return #err("Kuendigung fehlgeschlagen (" # status.toText() # "): " # responseBody);
    };
    let updated = { sub with stripeCancelAtPeriodEnd = true; lastStripeSyncAt = ?Time.now() };
    saveSubscription(updated);
    #ok(updated);
  };

  public shared ({ caller }) func reactivateStripeSubscription(
    companyId : Nat
  ) : async CommonTypes.Result<CostDashboardTypes.CompanySubscription> {
    if (not isCompanyAdminOrManager(caller, companyId)) {
      return #err("Keine Berechtigung");
    };
    let secretKey = getStripeSecretKey();
    if (secretKey == "") return #err("Stripe Secret Key nicht konfiguriert");
    let sub = getOrDefaultSubscription(companyId);
    let stripeSubId = switch (sub.stripeSubscriptionId) {
      case null { return #err("Kein aktives Stripe-Abonnement") };
      case (?id) id;
    };
    let (status, responseBody) = await stripePost(
      "/v1/subscriptions/" # stripeSubId,
      "cancel_at_period_end=false",
      secretKey
    );
    if (status >= 400 or isStripeError(responseBody)) {
      return #err("Reaktivierung fehlgeschlagen (" # status.toText() # "): " # responseBody);
    };
    let updated = { sub with stripeCancelAtPeriodEnd = false; lastStripeSyncAt = ?Time.now() };
    saveSubscription(updated);
    #ok(updated);
  };

  public query ({ caller }) func getStripeEvents(
    companyId : ?Nat,
    limit     : Nat,
  ) : async [CostDashboardTypes.StripeEvent] {
    if (not checkIsStripePlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    let allEvents = stripeEvents.values().toArray();
    let filtered = switch (companyId) {
      case null { allEvents };
      case (?cid) { allEvents.filter(func(ev) { ev.tenantId == ?cid }) };
    };
    let sorted = filtered.sort(func(a, b) {
      if (a.receivedAt > b.receivedAt) #less
      else if (a.receivedAt < b.receivedAt) #greater
      else #equal
    });
    if (sorted.size() <= limit) sorted
    else sorted.sliceToArray(0, limit.toInt());
  };

  public shared ({ caller }) func manuallyTriggerStripeSync(
    companyId : Nat
  ) : async CommonTypes.Result<Text> {
    if (not checkIsStripePlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    switch (await doSyncStripeSubscription(companyId)) {
      case (#err(e)) { #err(e) };
      case (#ok(_))  { #ok("Synchronisation erfolgreich fuer Mandant " # companyId.toText()) };
    };
  };

  public shared ({ caller }) func relinkStripeCustomer(
    companyId        : Nat,
    stripeCustomerId : Text,
  ) : async CommonTypes.Result<Text> {
    if (not checkIsStripePlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let sub = getOrDefaultSubscription(companyId);
    saveSubscription({ sub with stripeCustomerId = ?stripeCustomerId; lastStripeSyncAt = ?Time.now() });
    #ok("Customer " # stripeCustomerId # " fuer Mandant " # companyId.toText() # " verknuepft");
  };

  public shared ({ caller }) func createStripeCheckoutLinkForCompany(
    companyId    : Nat,
    planId       : Text,
    billingModel : CostDashboardTypes.BillingModel,
  ) : async CommonTypes.Result<{ url : Text; sessionId : Text }> {
    if (not checkIsStripePlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let plan = switch (subscriptionPlansV3.get(planId)) {
      case null { return #err("Plan nicht gefunden: " # planId) };
      case (?p) p;
    };
    if (not plan.requiresPayment) {
      return #err("Kostenloser Plan benoetigt keinen Checkout");
    };
    let priceId : Text = switch (billingModel) {
      case (#monthly) {
        switch (plan.stripePriceId) {
          case null { return #err("Plan hat keine Stripe Price ID (monatlich)") };
          case (?pid) pid;
        };
      };
      case (#yearly) {
        switch (plan.stripePriceIdYearly) {
          case null {
            switch (plan.stripePriceId) {
              case null { return #err("Plan hat keine Stripe Price ID") };
              case (?pid) pid;
            };
          };
          case (?pid) pid;
        };
      };
    };
    await doCreateCheckoutSession(companyId, planId, billingModel, priceId);
  };

  public shared ({ caller }) func createStripeCheckoutLinkForCompanyWithPrice(
    companyId    : Nat,
    planId       : Text,
    billingModel : CostDashboardTypes.BillingModel,
    priceId      : Text,
  ) : async CommonTypes.Result<{ url : Text; sessionId : Text }> {
    if (not checkIsStripePlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    if (priceId == "") return #err("priceId darf nicht leer sein");
    await doCreateCheckoutSession(companyId, planId, billingModel, priceId);
  };

  public shared ({ caller }) func reprocessStripeEvent(
    stripeEventId : Text
  ) : async CommonTypes.Result<Text> {
    if (not checkIsStripePlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let event = switch (stripeEvents.get(stripeEventId)) {
      case null { return #err("Stripe-Event nicht gefunden: " # stripeEventId) };
      case (?ev) ev;
    };
    if (event.processingStatus != #failed) {
      return #err("Nur fehlgeschlagene Events koennen erneut verarbeitet werden");
    };
    let rawPayload = switch (event.rawPayload) {
      case null { return #err("Kein Payload fuer dieses Event vorhanden") };
      case (?p) p;
    };
    stripeEvents.add(stripeEventId, { event with processingStatus = #received; errorMessage = null });
    let processResult = await processStripeEvent(event.eventType, rawPayload);
    let (finalStatus, errorMsg) = switch (processResult) {
      case (#ok(_))  { (#processed, null) };
      case (#err(e)) { (#failed, ?e) };
    };
    stripeEvents.add(stripeEventId, { event with processedAt = ?Time.now(); processingStatus = finalStatus; errorMessage = errorMsg });
    switch (processResult) {
      case (#ok(_))  { #ok("Event erneut verarbeitet: " # event.eventType) };
      case (#err(e)) { #err("Erneute Verarbeitung fehlgeschlagen: " # e) };
    };
  };

  public shared ({ caller }) func testStripeConnection() : async {
    apiConnectionOk      : Bool;
    apiConnectionMessage : Text;
    customerPortalOk     : Bool;
    customerPortalMessage : Text;
  } {
    if (not checkIsStripePlatformAdmin(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    let secretKey = getStripeSecretKey();
    if (secretKey == "") {
      return {
        apiConnectionOk      = false;
        apiConnectionMessage = "Kein API-Key konfiguriert";
        customerPortalOk     = false;
        customerPortalMessage = "Kein API-Key konfiguriert";
      };
    };
    // Test 1: API-Verbindung via GET /v1/balance
    let (balanceStatus, balanceBody) = await stripeGet("/v1/balance", secretKey);
    let apiOk = balanceStatus >= 200 and balanceStatus < 300 and not isStripeError(balanceBody);
    let apiMsg = if (apiOk) {
      "API-Verbindung erfolgreich"
    } else {
      "API-Verbindung fehlgeschlagen (" # balanceStatus.toText() # ")"
    };
    // Test 2: Kundenportal-Konfiguration via GET /v1/billing_portal/configurations
    let (portalStatus, portalBody) = await stripeGet("/v1/billing_portal/configurations", secretKey);
    let portalOk = portalStatus >= 200 and portalStatus < 300 and not isStripeError(portalBody);
    let portalMsg = if (not portalOk) {
      "Kundenportal nicht erreichbar (" # portalStatus.toText() # ")"
    } else {
      let hasData = portalBody.contains(#text("\"data\""));
      let isEmpty = portalBody.contains(#text("\"data\":[]"));
      if (isEmpty) "Kundenportal erreichbar, aber keine Konfiguration aktiv"
      else if (hasData) "Kundenportal aktiv und konfiguriert"
      else "Kundenportal erreichbar"
    };
    { apiConnectionOk = apiOk; apiConnectionMessage = apiMsg; customerPortalOk = portalOk; customerPortalMessage = portalMsg };
  };

  public shared ({ caller }) func compareStripeSubscriptionStatus(
    companyId : Nat
  ) : async CommonTypes.Result<{
    internalStatus : Text;
    stripeStatus   : Text;
    inSync         : Bool;
  }> {
    if (not checkIsStripePlatformAdmin(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let secretKey = getStripeSecretKey();
    if (secretKey == "") return #err("Stripe Secret Key nicht konfiguriert");
    let sub = getOrDefaultSubscription(companyId);
    let internalStatus = switch (sub.stripeStatus) {
      case null "none";
      case (?s) mapStripeStatusToInternal(s);
    };
    let stripeSubId = switch (sub.stripeSubscriptionId) {
      case null {
        return #ok({
          internalStatus;
          stripeStatus = "none";
          inSync       = internalStatus == "none";
        });
      };
      case (?id) id;
    };
    let (status, responseBody) = await stripeGet("/v1/subscriptions/" # stripeSubId, secretKey);
    if (status >= 400 or isStripeError(responseBody)) {
      return #err("Stripe Abfrage fehlgeschlagen: " # responseBody);
    };
    let stripeStatus = switch (extractJsonString(responseBody, "status")) {
      case null "unknown";
      case (?s) s;
    };
    let mappedStripeStatus = mapStripeStatusToInternal(stripeStatus);
    #ok({
      internalStatus;
      stripeStatus = mappedStripeStatus;
      inSync       = internalStatus == mappedStripeStatus;
    });
  };
};
