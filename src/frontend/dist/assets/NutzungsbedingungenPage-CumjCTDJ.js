import { a as useNavigate, j as jsxRuntimeExports } from "./index-Blf-A8DR.js";
import { A as ArrowLeft } from "./arrow-left-94BJxSRC.js";
import "./createLucideIcon-BzNCDVU7.js";
const AGB_SECTIONS = [
  {
    para: "§1",
    title: "Geltungsbereich",
    text: "Diese AGB gelten für alle Leistungen von iServices AG, Schuppisstrasse 2, 8050 Zürich (nachfolgend «iServices»), gegenüber Kunden und Nutzern der iReport-Plattform."
  },
  {
    para: "§2",
    title: "Vertragsstruktur",
    text: "Verträge kommen durch schriftliche Auftragsbestätigung oder durch Nutzung der Dienste zustande. Es gilt das schweizerische Recht."
  },
  {
    para: "§3",
    title: "Vertragsabschluss",
    text: "Der Vertrag entsteht mit der Registrierung auf der Plattform und Akzeptanz dieser AGB. Mit der Nutzung akzeptiert der Nutzer alle Bedingungen."
  },
  {
    para: "§4",
    title: "Vertragsgegenstand",
    text: "iServices stellt eine webbasierte Plattform (iReport) zur Zeiterfassung, Spesenverwaltung und Personaladministration bereit."
  },
  {
    para: "§5",
    title: "Dienstleistungen",
    text: "iServices erbringt Software-as-a-Service-Leistungen gemäss dem jeweils gebuchten Paket. Der Umfang der Leistungen ergibt sich aus der aktuellen Produktbeschreibung."
  },
  {
    para: "§6",
    title: "Mitwirkungspflichten",
    text: "Der Kunde stellt die für die Erbringung der Leistungen erforderlichen Informationen und Zugänge rechtzeitig zur Verfügung."
  },
  {
    para: "§7",
    title: "Preise und Zahlungsbedingungen",
    text: "Die Preise verstehen sich in CHF exkl. MwSt. Rechnungen sind innert 30 Tagen netto zahlbar. Bei Zahlungsverzug kann iServices Verzugszinsen verlangen."
  },
  {
    para: "§8",
    title: "Eigentumsvorbehalt",
    text: "Alle von iServices erstellten Unterlagen, Konzepte und Software bleiben bis zur vollständigen Bezahlung Eigentum von iServices."
  },
  {
    para: "§9",
    title: "Rechte an Software",
    text: "iServices räumt dem Kunden ein nicht-exklusives, nicht übertragbares Nutzungsrecht an der Software ein. Eine Weitergabe an Dritte ist untersagt."
  },
  {
    para: "§10",
    title: "Lieferung und Leistungszeit",
    text: "Termine sind unverbindlich, sofern nicht ausdrücklich als bindend vereinbart. iServices bemüht sich um eine termingerechte Leistungserbringung."
  },
  {
    para: "§11",
    title: "Leistungsänderungen",
    text: "iServices behält sich vor, Funktionalitäten anzupassen oder weiterzuentwickeln. Wesentliche Einschränkungen werden dem Kunden rechtzeitig mitgeteilt."
  },
  {
    para: "§12",
    title: "Erfüllung und Abnahme",
    text: "Leistungen gelten als abgenommen, wenn der Kunde nicht innert 10 Arbeitstagen nach Lieferung schriftlich Mängel rügt."
  },
  {
    para: "§13",
    title: "Gewährleistungen",
    text: "iServices gewährleistet eine Verfügbarkeit der Plattform von 99% pro Monat (exkl. geplante Wartungsfenster). Mängelrügen sind unverzüglich zu melden."
  },
  {
    para: "§14",
    title: "Haftung",
    text: "Die Haftung von iServices ist auf das pro Jahr bezahlte Entgelt beschränkt. Haftung für Folgeschäden, entgangenen Gewinn oder indirekte Schäden ist ausgeschlossen."
  },
  {
    para: "§15",
    title: "Geheimhaltung und Datenschutz",
    text: "Beide Parteien verpflichten sich zur Vertraulichkeit. Kundendaten werden ausschliesslich gemäss den Datenschutzbestimmungen von iServices verarbeitet und nicht an Dritte weitergegeben."
  },
  {
    para: "§16",
    title: "Loyalität",
    text: "Der Kunde verpflichtet sich, Mitarbeitende von iServices nicht direkt abzuwerben."
  },
  {
    para: "§17",
    title: "Dauer und Auflösung",
    text: "Verträge laufen auf unbestimmte Zeit und können mit einer Frist von 30 Tagen auf Monatsende gekündigt werden. Das Recht zur fristlosen Kündigung aus wichtigem Grund bleibt vorbehalten."
  },
  {
    para: "§18",
    title: "Schlussbestimmungen",
    text: "Gerichtsstand ist Zürich. Es gilt schweizerisches Recht. Änderungen dieser AGB werden dem Kunden schriftlich oder per E-Mail mitgeteilt."
  }
];
function BackLink({ onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: "inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-150",
      style: { color: "#1F6495", fontFamily: "'Play', sans-serif" },
      onMouseEnter: (e) => {
        e.currentTarget.style.color = "#0A4A75";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.color = "#1F6495";
      },
      "data-ocid": "nutzungsbedingungen.back_link",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
        "Zurück zur Startseite"
      ]
    }
  );
}
function NutzungsbedingungenPage() {
  const navigate = useNavigate();
  const goHome = () => navigate({ to: "/" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen bg-white",
      style: { fontFamily: "'Play', sans-serif" },
      "data-ocid": "nutzungsbedingungen.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "nav",
          {
            className: "sticky top-0 z-50 border-b",
            style: {
              backgroundColor: "#0A4A75",
              borderColor: "rgba(255,255,255,0.12)"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[1280px] mx-auto px-6 flex items-center h-14", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: goHome,
                className: "flex items-center gap-2",
                "aria-label": "Zurück zur Startseite",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: "/assets/logo_transparent.png",
                    alt: "iReport",
                    className: "h-8 w-auto"
                  }
                )
              }
            ) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[800px] mx-auto px-6 py-14", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BackLink, { onClick: goHome }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "mt-8 mb-12 pb-8 border-b",
              style: { borderColor: "rgba(10,74,117,0.12)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: "/assets/logo_transparent.png",
                    alt: "iServices AG Logo",
                    className: "h-14 w-auto"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h1",
                  {
                    className: "text-3xl md:text-4xl font-bold mb-2",
                    style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
                    children: "Allgemeine Geschäftsbedingungen (AGB)"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: { color: "#64748b" }, children: "iServices AG · Schuppisstrasse 2 · 8050 Zürich" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", style: { color: "#94a3b8" }, children: "Stand: Januar 2026" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-10", children: AGB_SECTIONS.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-col gap-3",
              "data-ocid": `nutzungsbedingungen.section.${section.para.toLowerCase()}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-sm font-bold shrink-0 px-2.5 py-0.5 rounded",
                      style: {
                        backgroundColor: "rgba(10,74,117,0.08)",
                        color: "#1F6495",
                        fontFamily: "'Play', sans-serif"
                      },
                      children: section.para
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h2",
                    {
                      className: "text-lg font-bold",
                      style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
                      children: section.title
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "text-sm leading-relaxed pl-[2.5rem]",
                    style: { color: "#4a5568" },
                    children: section.text
                  }
                )
              ]
            },
            section.para
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "mt-16 pt-8 border-t text-center",
              style: { borderColor: "rgba(10,74,117,0.12)" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", style: { color: "#94a3b8" }, children: "iServices AG · Schuppisstrasse 2 · 8050 Zürich" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BackLink, { onClick: goHome }) })
        ] })
      ]
    }
  );
}
export {
  NutzungsbedingungenPage as default
};
