// iReport Onchain V3.1 — Benachrichtigungs-API-Mixin
// Vollständige Implementierung des internen mandantenfähigen Benachrichtigungssystems.
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import NotificationTypes "../types/notification";
import CommonTypes "../types/common";
import CompanyTypes "../types/company";

mixin (
  notifications       : Map.Map<Text, NotificationTypes.Notification>,
  readStatuses        : Map.Map<Text, NotificationTypes.ReadStatus>,
  deleteStatuses      : Map.Map<Text, NotificationTypes.DeleteStatus>,
  nextNotificationId  : { var value : Nat },
  platformAdminPrincipal : { var value : ?Principal },
  principalToCompany  : Map.Map<Principal, CommonTypes.CompanyId>,
  principalToEmployee : Map.Map<Principal, CommonTypes.EmployeeId>,
  employees           : List.List<CompanyTypes.Employee>,
  companies           : List.List<CompanyTypes.Company>,
) {

  // ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

  /// Erzeugt eine eindeutige Benachrichtigungs-ID
  private func genNotificationId() : Text {
    let id = nextNotificationId.value;
    nextNotificationId.value += 1;
    "NTF-" # id.toText();
  };

  /// Prüft ob caller zur Platform-Admin-Firma gehört (erster registrierter Benutzer)
  private func isPlatformAdminCaller(caller : Principal) : Bool {
    switch (platformAdminPrincipal.value) {
      case null { false };
      case (?pa) { Principal.equal(pa, caller) };
    };
  };

  /// Gibt die companyId des callers zurück, oder null wenn nicht registriert
  private func callerCompanyId(caller : Principal) : ?CommonTypes.CompanyId {
    principalToCompany.get(caller);
  };

  /// Gibt die employeeId des callers zurück, oder null
  private func callerEmployeeId(caller : Principal) : ?CommonTypes.EmployeeId {
    principalToEmployee.get(caller);
  };

  /// Gibt die Rolle des callers zurück (als Text), oder null
  private func callerRole(caller : Principal, companyId : CommonTypes.CompanyId) : ?Text {
    switch (principalToEmployee.get(caller)) {
      case null { null };
      case (?empId) {
        switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
          case null { null };
          case (?e) {
            let roleText = switch (e.role) {
              case (#admin) "admin";
              case (#manager) "manager";
              case (#employee) "employee";
            };
            ?roleText;
          };
        };
      };
    };
  };

  /// Gibt den Anzeigenamen des callers zurück
  private func callerDisplayName(caller : Principal, companyId : CommonTypes.CompanyId) : Text {
    switch (principalToEmployee.get(caller)) {
      case null { caller.toText() };
      case (?empId) {
        switch (employees.find(func(e) { e.id == empId and e.companyId == companyId })) {
          case null { caller.toText() };
          case (?e) { e.firstName # " " # e.lastName };
        };
      };
    };
  };

  /// Prüft ob eine Benachrichtigung für einen Benutzer sichtbar ist
  private func isNotificationVisibleToUser(
    notif     : NotificationTypes.Notification,
    companyId : CommonTypes.CompanyId,
    userId    : Text,
    role      : ?Text,
  ) : Bool {
    // Status muss #sent sein
    if (notif.status != #sent) return false;
    // validFrom <= now
    let now = Time.now();
    if (notif.validFrom > now) return false;
    // validUntil: falls gesetzt, muss >= now sein
    switch (notif.validUntil) {
      case (?until) { if (until < now) return false };
      case null {};
    };
    // Empfängerlogik
    let companyIdText = companyId.toText();
    switch (notif.targetType) {
      case (#tenant) {
        notif.targetTenantIds.any(func(tid) { tid == companyIdText });
      };
      case (#role) {
        switch (role) {
          case null { false };
          case (?r) { notif.targetRoleIds.any(func(rid) { rid == r }) };
        };
      };
      case (#user) {
        notif.targetUserIds.any(func(uid) { uid == userId });
      };
      case (#mixed) {
        let tenantMatch = notif.targetTenantIds.any(func(tid) { tid == companyIdText });
        let roleMatch = switch (role) {
          case null { false };
          case (?r) { notif.targetRoleIds.any(func(rid) { rid == r }) };
        };
        let userMatch = notif.targetUserIds.any(func(uid) { uid == userId });
        tenantMatch or roleMatch or userMatch;
      };
    };
  };

  /// Gibt alle sichtbaren, nicht gelöschten Benachrichtigungen für einen Benutzer zurück
  private func visibleNotificationsForUser(
    caller    : Principal,
    companyId : CommonTypes.CompanyId,
    userId    : Text,
    role      : ?Text,
  ) : [NotificationTypes.UserNotification] {
    let deleteKey = func(nid : Text) : Text { nid # "_" # userId };
    let readKey   = func(nid : Text) : Text { nid # "_" # userId };
    notifications.values().toArray()
      .filter(func(n : NotificationTypes.Notification) : Bool {
        // Nicht gelöscht für diesen Benutzer
        if (deleteStatuses.containsKey(deleteKey(n.id))) return false;
        // Sichtbar
        isNotificationVisibleToUser(n, companyId, userId, role);
      })
      .map<NotificationTypes.Notification, NotificationTypes.UserNotification>(func(n) {
        let rk = readKey(n.id);
        let readStatusOpt = readStatuses.get(rk);
        let isRead = switch (readStatusOpt) { case (?_) true; case null false };
        let readAt = switch (readStatusOpt) { case (?rs) ?rs.readAt; case null null };
        { notification = n; isRead; isDeleted = false; readAt };
      });
  };

  // ─── Plattform-Admin: Benachrichtigungen erstellen & verwalten ────────────────

  /// Erstellt einen Entwurf ohne sofortigen Versand.
  public shared ({ caller }) func createNotificationDraft(
    title           : Text,
    messageBody     : Text,
    messageFormat   : NotificationTypes.NotificationFormat,
    priority        : NotificationTypes.NotificationPriority,
    validFrom       : Int,
    validUntil      : ?Int,
    targetType      : NotificationTypes.NotificationTargetType,
    targetTenantIds : [Text],
    targetRoleIds   : [Text],
    targetUserIds   : [Text],
  ) : async { #ok : NotificationTypes.Notification; #err : Text } {
    if (not isPlatformAdminCaller(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let senderDisplayName = "Administrator";
    let id = genNotificationId();
    let notif : NotificationTypes.Notification = {
      id;
      title;
      messageBody;
      messageFormat;
      senderUserId      = caller.toText();
      senderDisplayName;
      createdAt         = Time.now();
      validFrom;
      validUntil;
      priority;
      targetType;
      targetTenantIds;
      targetRoleIds;
      targetUserIds;
      status            = #draft;
    };
    notifications.add(id, notif);
    #ok(notif);
  };

  /// Versendet einen gespeicherten Entwurf.
  public shared ({ caller }) func sendNotification(
    notificationId : Text,
  ) : async { #ok; #err : Text } {
    if (not isPlatformAdminCaller(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    switch (notifications.get(notificationId)) {
      case null { #err("Benachrichtigung nicht gefunden") };
      case (?n) {
        if (n.status != #draft) {
          return #err("Benachrichtigung ist nicht im Entwurfsstatus");
        };
        let updated : NotificationTypes.Notification = { n with status = #sent };
        notifications.add(notificationId, updated);
        #ok;
      };
    };
  };

  /// Erstellt eine Benachrichtigung und versendet sie sofort.
  public shared ({ caller }) func saveAndSendNotification(
    title           : Text,
    messageBody     : Text,
    messageFormat   : NotificationTypes.NotificationFormat,
    priority        : NotificationTypes.NotificationPriority,
    validFrom       : Int,
    validUntil      : ?Int,
    targetType      : NotificationTypes.NotificationTargetType,
    targetTenantIds : [Text],
    targetRoleIds   : [Text],
    targetUserIds   : [Text],
  ) : async { #ok : NotificationTypes.Notification; #err : Text } {
    if (not isPlatformAdminCaller(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    let senderDisplayName = "Administrator";
    let id = genNotificationId();
    let notif : NotificationTypes.Notification = {
      id;
      title;
      messageBody;
      messageFormat;
      senderUserId      = caller.toText();
      senderDisplayName;
      createdAt         = Time.now();
      validFrom;
      validUntil;
      priority;
      targetType;
      targetTenantIds;
      targetRoleIds;
      targetUserIds;
      status            = #sent;
    };
    notifications.add(id, notif);
    #ok(notif);
  };

  /// Nur Platform-Admin: Gibt alle erstellten Benachrichtigungen zurück.
  public shared ({ caller }) func listAllNotifications() : async [NotificationTypes.Notification] {
    if (not isPlatformAdminCaller(caller)) {
      Runtime.trap("Keine Berechtigung: nur Platform Admin");
    };
    notifications.values().toArray();
  };

  /// Nur Platform-Admin: Archiviert eine Benachrichtigung.
  public shared ({ caller }) func archiveNotification(
    notificationId : Text,
  ) : async { #ok; #err : Text } {
    if (not isPlatformAdminCaller(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    switch (notifications.get(notificationId)) {
      case null { #err("Benachrichtigung nicht gefunden") };
      case (?n) {
        notifications.add(notificationId, { n with status = #archived });
        #ok;
      };
    };
  };

  /// Nur Platform-Admin: Dupliziert eine Benachrichtigung als neuen Entwurf.
  public shared ({ caller }) func duplicateNotification(
    notificationId : Text,
  ) : async { #ok : NotificationTypes.Notification; #err : Text } {
    if (not isPlatformAdminCaller(caller)) {
      return #err("Keine Berechtigung: nur Platform Admin");
    };
    switch (notifications.get(notificationId)) {
      case null { #err("Benachrichtigung nicht gefunden") };
      case (?n) {
        let newId = genNotificationId();
        let dup : NotificationTypes.Notification = {
          n with
          id        = newId;
          createdAt = Time.now();
          status    = #draft;
        };
        notifications.add(newId, dup);
        #ok(dup);
      };
    };
  };

  // ─── Benutzer: eigene Benachrichtigungen lesen & verwalten ───────────────────

  /// Gibt alle nicht gelöschten Benachrichtigungen des angemeldeten Benutzers zurück.
  public shared ({ caller }) func listMyNotifications() : async [NotificationTypes.UserNotification] {
    let companyId = switch (callerCompanyId(caller)) {
      case null { return [] };
      case (?cid) cid;
    };
    let userId = caller.toText();
    let role = callerRole(caller, companyId);
    visibleNotificationsForUser(caller, companyId, userId, role);
  };

  /// Gibt die Anzahl ungelesener, nicht gelöschter Benachrichtigungen zurück.
  public shared query ({ caller }) func getUnreadCount() : async Nat {
    let companyId = switch (callerCompanyId(caller)) {
      case null { return 0 };
      case (?cid) cid;
    };
    let userId = caller.toText();
    let role = callerRole(caller, companyId);
    let deleteKey = func(nid : Text) : Text { nid # "_" # userId };
    let readKey   = func(nid : Text) : Text { nid # "_" # userId };
    var count : Nat = 0;
    for (n in notifications.values()) {
      if (not deleteStatuses.containsKey(deleteKey(n.id)) and
          isNotificationVisibleToUser(n, companyId, userId, role) and
          not readStatuses.containsKey(readKey(n.id))) {
        count += 1;
      };
    };
    count;
  };

  /// Markiert eine einzelne Benachrichtigung als gelesen.
  public shared ({ caller }) func markNotificationRead(
    notificationId : Text,
  ) : async { #ok; #err : Text } {
    let companyId = switch (callerCompanyId(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    let userId = caller.toText();
    let role = callerRole(caller, companyId);
    switch (notifications.get(notificationId)) {
      case null { #err("Benachrichtigung nicht gefunden") };
      case (?n) {
        if (not isNotificationVisibleToUser(n, companyId, userId, role)) {
          return #err("Keine Berechtigung oder Benachrichtigung nicht sichtbar");
        };
        let key = notificationId # "_" # userId;
        if (not readStatuses.containsKey(key)) {
          readStatuses.add(key, { notificationId; userId; readAt = Time.now() });
        };
        #ok;
      };
    };
  };

  /// Markiert alle Benachrichtigungen des Benutzers als gelesen.
  public shared ({ caller }) func markAllNotificationsRead() : async { #ok : Nat; #err : Text } {
    let companyId = switch (callerCompanyId(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    let userId = caller.toText();
    let role = callerRole(caller, companyId);
    let now = Time.now();
    var marked : Nat = 0;
    for (n in notifications.values()) {
      let key = n.id # "_" # userId;
      if (not deleteStatuses.containsKey(key) and
          isNotificationVisibleToUser(n, companyId, userId, role) and
          not readStatuses.containsKey(key)) {
        readStatuses.add(key, { notificationId = n.id; userId; readAt = now });
        marked += 1;
      };
    };
    #ok(marked);
  };

  /// Löscht eine Benachrichtigung nur für den angemeldeten Benutzer (Soft-Delete).
  public shared ({ caller }) func deleteMyNotification(
    notificationId : Text,
  ) : async { #ok; #err : Text } {
    let companyId = switch (callerCompanyId(caller)) {
      case null { return #err("Nicht authentifiziert") };
      case (?cid) cid;
    };
    let userId = caller.toText();
    let role = callerRole(caller, companyId);
    switch (notifications.get(notificationId)) {
      case null { #err("Benachrichtigung nicht gefunden") };
      case (?n) {
        if (not isNotificationVisibleToUser(n, companyId, userId, role)) {
          return #err("Keine Berechtigung oder Benachrichtigung nicht sichtbar");
        };
        let key = notificationId # "_" # userId;
        if (not deleteStatuses.containsKey(key)) {
          deleteStatuses.add(key, { notificationId; userId; deletedAt = Time.now() });
        };
        #ok;
      };
    };
  };

};
