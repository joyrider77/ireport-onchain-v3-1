// Typen für das Kosten-Dashboard (Platform Admin only)
// iReport Onchain V3.1
module {
  // Snapshot der Cycle-Stände beider Canisters zu einem Zeitpunkt
  public type CycleSnapshot = {
    timestamp : Int;         // Nanosekunden (Time.now())
    frontendCycles : Nat;
    backendCycles : Nat;
  };

  // Einstellungen für das Kosten-Dashboard (manuell konfigurierbar)
  public type CostSettings = {
    icpPriceUsd : Float;                // ICP-Preis in USD (manuell)
    usdChfRate : Float;                 // USD/CHF-Wechselkurs (manuell)
    frontendAlertThreshold : Nat;       // Cycle-Schwellenwert Frontend
    backendAlertThreshold : Nat;        // Cycle-Schwellenwert Backend
    alertEnabled : Bool;                // Alerts aktiviert
  };

  // Cycle-Status (live oder aus Snapshots)
  public type CycleStatus = {
    backendCycles : Nat;           // Live-Stand des Backend-Canisters (ExperimentalCycles.balance())
    frontendCycles : ?Nat;         // Letzter bekannter Stand des Frontend-Canisters (aus Snapshots)
    dataSource : Text;             // "live" (Backend direkt) oder "manual" (aus manuellen Snapshots)
  };

  // Kombiniertes Dashboard-Datenobjekt (für getCostDashboardData)
  public type CostDashboardData = {
    snapshots : [CycleSnapshot];
    settings : CostSettings;
    frontendCanisterId : Text;
    backendCanisterId : Text;
    backendCyclesBalance : ?Nat;   // Live-Cycle-Stand des Backend-Canisters (null wenn nicht verfügbar)
    dataSource : Text;             // "live" oder "manual"
  };

  // Canister-Status-Info (live, ohne Management-Canister-Zugriff)
  public type CanisterStatusInfo = {
    backendCanisterId : Text;
    backendCycles : Nat;
    backendMemorySize : Nat;
    backendStatus : Text;     // immer "running" (Query wird nur ausgeführt wenn Canister läuft)
    frontendCanisterId : Text; // gespeicherte Frontend Canister-ID
    dataSource : Text;        // "live"
    timestamp : Int;
  };

  // Mandanten-Kostenaufschlüsselung (proportional nach Mitarbeiteranzahl)
  public type TenantCostEntry = {
    companyId : Nat;
    companyName : Text;
    estimatedCycles : Nat;
    employeeCount : Nat;
  };

  // ─── Abonnement-Konfiguration ─────────────────────────────────────────────────

  // Zahlungsanbieter für einen Abonnement-Plan
  public type PaymentProvider = { #none; #stripe; #manual };

  // Stripe-Subscription-Status (gespiegelt von Stripe API)
  public type StripeSubscriptionStatus = {
    #active;
    #past_due;
    #unpaid;
    #canceled;
    #incomplete;
    #incomplete_expired;
    #trialing;
    #paused;
  };

  // Status eines verarbeiteten Stripe-Events
  public type StripeEventStatus = { #received; #processed; #failed; #ignored };

  // Stripe-Event-Protokolleintrag (idempotente Webhook-Verarbeitung)
  public type StripeEvent = {
    id                  : Text;
    stripeEventId       : Text;
    eventType           : Text;
    receivedAt          : Int;
    processedAt         : ?Int;
    processingStatus    : StripeEventStatus;
    tenantId            : ?Nat;
    subscriptionId      : ?Text;
    stripeCustomerId    : ?Text;
    stripeSubscriptionId : ?Text;
    errorMessage        : ?Text;
    rawPayload          : ?Text;
  };

  // Stripe-Rechnung (synchronisiert via Webhook)
  public type StripeInvoice = {
    id                  : Text;
    companyId           : Nat;
    stripeInvoiceId     : Text;
    stripeCustomerId    : Text;
    stripeSubscriptionId : ?Text;
    invoiceNumber       : ?Text;
    amountDue           : Float;
    amountPaid          : Float;
    currency            : Text;
    status              : Text;    // draft/open/paid/uncollectible/void
    hostedInvoiceUrl    : ?Text;
    invoicePdfUrl       : ?Text;
    periodStart         : ?Int;
    periodEnd           : ?Int;
    dueDate             : ?Int;
    issuedAt            : Int;
    paidAt              : ?Int;
  };

  // Stripe Checkout Session (kurzlebig, läuft nach ca. 24h ab)
  public type StripeCheckoutSession = {
    id               : Text;
    companyId        : Nat;
    stripeSessionId  : Text;
    stripePriceId    : Text;
    planId           : Text;
    billingModel     : BillingModel;
    createdAt        : Int;
    expiresAt        : ?Int;
    status           : Text;    // open/complete/expired
    stripeCustomerId : ?Text;
  };

  // Abonnement-Plan (konfigurierbar durch Platform Admin)
  public type SubscriptionPlan = {
    id : Text;                          // Eindeutiger Bezeichner, z.B. "basis", "professional"
    name : Text;                        // Anzeigename
    description : Text;                 // Kurzbeschreibung
    pricePerMonthCHF : Float;           // Grundpreis pro Monat (CHF)
    pricePerYearCHF : Float;            // Grundpreis pro Jahr (CHF)
    minActiveDaysPerMonth : Nat;        // Mindesttage aktiv pro Monat um als aktiv zu gelten
    maxEmployees : ?Nat;                // Max. Mitarbeitende (null = unbegrenzt)
    features : [Text];                  // Enthaltene Funktionen (Liste)
    isActive : Bool;                    // Plan aktiv/inaktiv
    sortOrder : Nat;                    // Reihenfolge in der Anzeige (aufsteigend)
    updatedAt : Int;                    // Letzter Änderungszeitpunkt (Nanosekunden)
    // ─── Stripe-Erweiterungsfelder (optional) ─────────────────────────────────
    stripeProductId    : ?Text;         // Stripe Product ID
    stripePriceId      : ?Text;         // Stripe Price ID (monatlich)
    stripePriceIdYearly : ?Text;        // Stripe Price ID (jährlich)
    stripeLookupKey    : ?Text;         // Stripe Lookup Key
    paymentProvider    : PaymentProvider; // Zahlungsanbieter
    requiresPayment    : Bool;          // true = kostenpflichtig
    stripeMode         : ?Text;         // "test" oder "live"
    // ─── Marketing-Erweiterungsfelder ─────────────────────────────────────────
    isRecommended      : Bool;          // true = Empfohlener/hervorgehobener Plan
    additionalFeatures : [Text];        // Manuell erfasste Zusatzfunktionen (z.B. "Premium-Support")
  };

  // Abrechnungsmodell pro Mandant
  public type BillingModel = { #monthly; #yearly };

  // Mandanten-Abo-Zuweisung mit Abrechnungsmodell
  public type CompanySubscription = {
    companyId             : Nat;
    planId                : Text;
    billingModel          : BillingModel;
    subscriptionStartDate : ?Int;   // Nanosekunden, gesetzt bei erster Zuweisung/Modellwechsel
    proRataAmount         : ?Float; // Ausstehender Pro-rata-Betrag (positiv = Nachzahlung, negativ = Guthaben)
    proRataNote           : ?Text;  // Beschreibung des Pro-rata-Betrags
    proRataCalculatedAt   : ?Int;   // Zeitpunkt der Pro-rata-Berechnung (Nanosekunden)
    nextDueDate           : ?Int;   // Nächstes Fälligkeitsdatum (Nanosekunden)
    // ─── Stripe-Erweiterungsfelder ─────────────────────────────────────────────
    stripeCustomerId           : ?Text; // Stripe Customer ID des Mandanten
    stripeSubscriptionId       : ?Text; // Stripe Subscription ID
    stripeProductId            : ?Text; // Stripe Product ID (zum Zeitpunkt der Aktivierung)
    stripeStatus               : ?Text; // Stripe-Status (active/past_due/canceled/...)
    stripeCurrentPeriodStart   : ?Int;  // Beginn der aktuellen Abrechnungsperiode (Unix-Timestamp)
    stripeCurrentPeriodEnd     : ?Int;  // Ende der aktuellen Abrechnungsperiode (Unix-Timestamp)
    stripeCancelAtPeriodEnd    : Bool;  // true = Abo läuft bis Periodenende und wird dann beendet
    latestStripeInvoiceId      : ?Text; // ID der letzten Stripe-Rechnung
    latestStripePaymentStatus  : ?Text; // Zahlungsstatus der letzten Rechnung
    lastStripeSyncAt           : ?Int;  // Zeitpunkt der letzten Synchronisation mit Stripe (Nanosekunden)
    scheduledPlanChangeId      : ?Text; // Geplanter Planwechsel (targetPlanId)
    scheduledPlanChangePriceId : ?Text; // Stripe Price ID des geplanten Plans
    scheduledPlanChangeEffectiveAt : ?Int; // Zeitpunkt des geplanten Planwechsels (Nanosekunden)
  };

  // Monatlicher Abrechnungseintrag pro Mandant
  public type MonthlyBillingEntry = {
    companyId             : Nat;
    companyName           : Text;
    planId                : Text;
    planName              : Text;
    activeUserCount       : Nat;     // Real-time: Anzahl Mitarbeiter mit active==true
    billableUserCount     : Nat;     // Abrechnungsrelevant: Anzahl Mitarbeiter >= minActiveDaysPerMonth
    totalCHF              : Float;
    month                 : Text;    // z.B. "04" (zweistellig)
    year                  : Nat;
    billingModel          : ?Text;   // "monthly" | "yearly" | null
    nextDueDateTimestamp  : ?Int;    // Nanosekunden
    proRataAmount         : ?Float;  // Nachzahlung (upgrade) oder Guthaben (downgrade)
    proRataNote           : ?Text;
    creditAmount          : ?Float;
  };
  // OpenAI-Konfiguration (Platform Admin only, API Key niemals an Browser zurückgeben)
  public type OpenAIConfig = {
    apiKey : Text;
  };

  // Stripe-Konfiguration (Platform Admin only, serverseitig gespeichert)
  public type StripeConfig = {
    secretKey      : Text;
    publishableKey : Text;
    webhookSecret  : Text;
  };
};

