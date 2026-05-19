// iReport Onchain V3.1 — Benachrichtigungstypen
// Datenmodell für das interne, mandantenfähige Benachrichtigungssystem
module {

  /// Format des Nachrichtentexts
  public type NotificationFormat = {
    #markdown;
    #html;
  };

  /// Priorität einer Benachrichtigung
  public type NotificationPriority = {
    #normal;
    #important;
    #critical;
  };

  /// Verarbeitungsstatus einer Benachrichtigung
  public type NotificationStatus = {
    #draft;
    #sent;
    #archived;
  };

  /// Typ des Empfängerkreises
  public type NotificationTargetType = {
    #tenant;
    #role;
    #user;
    #mixed;
  };

  /// Zentrale Benachrichtigungsnachricht (einmal gespeichert)
  public type Notification = {
    id                : Text;
    title             : Text;
    messageBody       : Text;
    messageFormat     : NotificationFormat;
    senderUserId      : Text;
    senderDisplayName : Text;
    createdAt         : Int;
    validFrom         : Int;
    validUntil        : ?Int;
    priority          : NotificationPriority;
    targetType        : NotificationTargetType;
    targetTenantIds   : [Text];
    targetRoleIds     : [Text];
    targetUserIds     : [Text];
    status            : NotificationStatus;
  };

  /// Lesestatus pro Benutzer
  public type ReadStatus = {
    notificationId : Text;
    userId         : Text;
    readAt         : Int;
  };

  /// Löschstatus pro Benutzer (Soft-Delete – nur für diesen Benutzer)
  public type DeleteStatus = {
    notificationId : Text;
    userId         : Text;
    deletedAt      : Int;
  };

  /// View-Model: Benachrichtigung aus Sicht eines Benutzers
  public type UserNotification = {
    notification : Notification;
    isRead       : Bool;
    isDeleted    : Bool;
    readAt       : ?Int;
  };

};
