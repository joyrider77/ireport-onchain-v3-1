const rules = [
  {
    code: "REST_TIME",
    name: "Tägliche Ruhezeit",
    beschreibung: "Mindestens 11h zwischen zwei Arbeitseinsätzen",
    kategorie: "Ruhezeit",
    standardwert: "11 Stunden",
  },
  {
    code: "WEEKEND_REST_TIME",
    name: "Wöchentliche Ruhezeit",
    beschreibung: "35h Ruhezeit (Sa 23:00–So 23:00)",
    kategorie: "Ruhezeit",
    standardwert: "35 Stunden",
  },
  {
    code: "PAUSE_MIN_5H30",
    name: "Mindestpause (>5h 30m)",
    beschreibung: "Bei Arbeitszeit >5.5h: mindestens 15 Min Pause",
    kategorie: "Pausen",
    standardwert: "15 Minuten",
  },
  {
    code: "PAUSE_MIN_7H",
    name: "Mindestpause (>7h)",
    beschreibung: "Bei Arbeitszeit >7h: mindestens 30 Min Pause",
    kategorie: "Pausen",
    standardwert: "30 Minuten",
  },
  {
    code: "PAUSE_MIN_9H",
    name: "Mindestpause (>9h)",
    beschreibung: "Bei Arbeitszeit >9h: mindestens 60 Min Pause",
    kategorie: "Pausen",
    standardwert: "60 Minuten",
  },
  {
    code: "OVERTIME_CONTRACTUAL",
    name: "Vertragliche Überstunden",
    beschreibung: "Arbeitszeit über der vertraglichen Sollzeit",
    kategorie: "Überzeit",
    standardwert: "0 Stunden Toleranz",
  },
  {
    code: "OVERTIME_LEGAL",
    name: "Gesetzliche Überzeit",
    beschreibung:
      "Arbeitszeit über der gesetzlichen Wochenhöchstarbeitszeit (45h oder 50h)",
    kategorie: "Überzeit",
    standardwert: "45 / 50 Stunden",
  },
  {
    code: "VACATION_MINIMUM",
    name: "Gesetzliches Ferienminimum",
    beschreibung: "Mindestens 4 Wochen Ferien/Jahr (5 bis 20. Lebensjahr)",
    kategorie: "Ferien",
    standardwert: "4 Wochen (5 bis 20. LJ)",
  },
  {
    code: "VACATION_TWO_WEEK_BLOCK",
    name: "Zusammenhängender Ferienblock",
    beschreibung: "Mindestens 10 Arbeitstage zusammenhängend pro Dienstjahr",
    kategorie: "Ferien",
    standardwert: "10 Arbeitstage",
  },
];

const kategorieColors: Record<string, string> = {
  Ruhezeit: "bg-blue-100 text-blue-800",
  Pausen: "bg-yellow-100 text-yellow-800",
  Überzeit: "bg-orange-100 text-orange-800",
  Ferien: "bg-green-100 text-green-800",
};

export default function ComplianceRegeln() {
  return (
    <div className="p-6 space-y-4" data-ocid="compliance.regeln_page">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        Die angezeigten Regeln entsprechen den Schweizer gesetzlichen Vorgaben.
        Das manuelle Anpassen von Regelparametern wird in einer zukünftigen
        Version ermöglicht.
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Regeln</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          Schweizer Arbeitsrecht (OR / ArG)
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table
          className="w-full border-collapse text-sm"
          data-ocid="compliance.regeln_table"
        >
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Regelname
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Beschreibung
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Kategorie
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Standardwert
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, idx) => (
              <tr
                key={rule.code}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                data-ocid={`compliance.regel_row.${idx + 1}`}
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {rule.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs">
                  {rule.beschreibung}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      kategorieColors[rule.kategorie] ??
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {rule.kategorie}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">
                  {rule.standardwert}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                    Aktiv
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        Diese Regelwerte entsprechen der Schweizer Gesetzgebung (OR, ArG).
        Individuelle Anpassungen sind in einer späteren Version konfigurierbar.
      </p>
    </div>
  );
}
