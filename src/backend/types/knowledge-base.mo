// Typen für die Support-KI-Wissensbasis – iReport Onchain V3.1
module {
  // Einzelner Wissensbasis-Eintrag
  public type KnowledgeEntry = {
    id        : Text;   // Eindeutige ID (z.B. "kb-001")
    category  : Text;   // "faq" | "feature" | "guide" | "help" | "trust"
    title     : Text;   // Kurztitel
    content   : Text;   // Vollständiger Inhalt
    language  : Text;   // "de" | "en"
    role      : Text;   // "all" | "admin" | "manager" | "mitarbeiter"
    isActive  : Bool;
    createdAt : Int;
    updatedAt : Int;
  };
};
