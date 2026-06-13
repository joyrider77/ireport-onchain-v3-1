import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Calendar,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Globe,
  Receipt,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import type { SubscriptionPlan } from "../backend.d";
import type { Company, Employee } from "../backend.d";

// ─── Types ───────────────────────────────────────────────────────────────────

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

type BackendResult<T> =
  | { __kind__: "ok"; ok: T }
  | { __kind__: "err"; err: string };

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Funktionen", href: "#funktionen" },
  { label: "Preise", href: "#preise" },
  { label: "FAQ", href: "#faq" },
];

const TRUST_LABELS = [
  { icon: Shield, label: "Sicher" },
  { icon: Globe, label: "Dezentral" },
  { icon: CheckCircle, label: "Effektiv" },
];

const FEATURES = [
  {
    icon: Clock,
    title: "Zeiterfassung",
    desc: "Erfasse Arbeitszeiten präzise nach Projekt und Leistungsart – auch unterwegs.",
  },
  {
    icon: Receipt,
    title: "Spesenverwaltung",
    desc: "Spesen mit Belegfotos erfassen, einreichen und genehmigen – papierlos.",
  },
  {
    icon: Calendar,
    title: "Kalenderübersicht",
    desc: "Vollständiger Monatsüberblick über Zeiten, Ferien und Abwesenheiten.",
  },
  {
    icon: CheckCircle,
    title: "Genehmigungen",
    desc: "Ferien- und Spesenanträge digital einreichen und freigeben.",
  },
  {
    icon: BarChart3,
    title: "Auswertungen",
    desc: "Übersichtliche Berichte zu Stunden, Kosten und Mitarbeiterauslastung.",
  },
  {
    icon: Users,
    title: "Mitarbeiterverwaltung",
    desc: "Stammdaten, Beschäftigungen und Ferienguthaben zentral verwalten.",
  },
  {
    icon: FileText,
    title: "Fakturierung",
    desc: "Verrechenbare Stunden und Spesen auf einen Blick für eine schnelle Rechnungsstellung.",
  },
];

const BENEFITS = [
  {
    icon: Globe,
    title: "Dezentralisiert",
    desc: "Daten leben auf dem Internet Computer – keine zentrale Server-Infrastruktur, keine Single Points of Failure.",
    accentColor: "#006066",
    accentLight: "rgba(0,96,102,0.10)",
    waveColor: "rgba(0,96,102,0.07)",
  },
  {
    icon: Shield,
    title: "Datensicherheit",
    desc: "Keine Drittserver, keine Abhängigkeiten von Cloud-Anbietern. Deine Daten gehören dir.",
    accentColor: "#0A4A75",
    accentLight: "rgba(10,74,117,0.10)",
    waveColor: "rgba(10,74,117,0.07)",
  },
  {
    icon: Eye,
    title: "Transparenz",
    desc: "Unveränderliche Blockchain-Protokollierung schafft vollständige Nachvollziehbarkeit.",
    accentColor: "#006066",
    accentLight: "rgba(0,96,102,0.10)",
    waveColor: "rgba(0,96,102,0.07)",
  },
];

const FAQS = [
  {
    id: "faq-was-ist",
    q: "Was ist iReport Onchain?",
    a: "iReport ist eine webbasierte HR- und Zeiterfassungsplattform für Schweizer Unternehmen. Sie läuft vollständig auf dem Internet Computer – dezentral, sicher und ohne zentrale Server.",
  },
  {
    id: "faq-anmeldung",
    q: "Wie funktioniert die Anmeldung?",
    a: "Die Authentifizierung erfolgt ausschliesslich über Internet Identity – ein dezentrales Identitätssystem ohne Passwörter. Du brauchst kein separates Konto zu erstellen.",
  },
  {
    id: "faq-sicherheit",
    q: "Wie sicher sind meine Daten?",
    a: "Deine Daten werden ausschliesslich im Internet Computer Canister deines Unternehmens gespeichert. Es gibt keine zentrale Datenbank, keine Drittanbieter und keine Abhängigkeiten von Cloud-Diensten.",
  },
  {
    id: "faq-kosten",
    q: "Was kostet iReport?",
    a: "Die Basisversion ist kostenlos und für Teams bis 2 Mitarbeitende geeignet. Die Professional-Version kostet CHF 6.00 pro Mitarbeiter / Monat im Jahres-Abonnement oder CHF 7.00 pro Mitarbeiter / Monat im Monats-Abonnement.",
  },
  {
    id: "faq-start",
    q: "Wie starte ich mit iReport?",
    a: "Klicke auf 'Anmelden mit Internet Identity', registriere dein Unternehmen und füge Mitarbeitende via Einladungslink hinzu. Der Einstieg dauert weniger als 5 Minuten.",
  },
  {
    id: "faq-mobile",
    q: "Funktioniert iReport auf dem Smartphone?",
    a: "Ja – iReport ist vollständig responsiv. Du kannst Zeiten und Spesen bequem vom Smartphone oder Tablet aus erfassen, ohne eine App installieren zu müssen.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LandingNav({
  onLogin,
  isLoggingIn,
}: {
  onLogin: () => void;
  isLoggingIn: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Floating nav pill — fixed height 56px, logo overflows visually */}
      <nav
        className="fixed z-50"
        style={{
          top: "16px",
          left: "12px",
          right: "12px",
          borderRadius: "12px",
          height: "56px",
          backgroundColor: "#00182b",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.22), 0 1px 6px rgba(0,0,0,0.12)",
          overflow: "visible",
        }}
        data-ocid="landing.nav"
      >
        <div
          className="flex items-center justify-between px-5"
          style={{ height: "56px" }}
        >
          {/* Logo — 72px, overflows the 56px container vertically */}
          <a
            href="/"
            className="flex items-center shrink-0"
            aria-label="iReport Startseite"
            style={{ height: "56px", overflow: "visible" }}
          >
            <img
              src="/assets/logo_transparent.png"
              alt="iReport"
              className="w-auto"
              style={{ height: "108px", display: "block" }}
            />
          </a>

          {/* Center nav links – desktop */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <NavLinkBtn
                key={link.label}
                label={link.label}
                targetId={link.href.slice(1)}
              />
            ))}
          </div>

          {/* Right: Anmelden + mobile burger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-60"
              style={{
                backgroundColor: "#5090C1",
                color: "#ffffff",
                fontFamily: "'Play', sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!isLoggingIn)
                  e.currentTarget.style.backgroundColor = "#1F6495";
              }}
              onMouseLeave={(e) => {
                if (!isLoggingIn)
                  e.currentTarget.style.backgroundColor = "#5090C1";
              }}
              data-ocid="landing.nav.login_button"
            >
              {isLoggingIn ? "Anmeldung läuft…" : "Anmelden"}
              {!isLoggingIn && <ChevronRight size={14} />}
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg transition-colors duration-150"
              aria-label="Menü öffnen"
              onClick={() => setMobileOpen((v) => !v)}
              style={{
                backgroundColor: mobileOpen
                  ? "rgba(255,255,255,0.10)"
                  : "transparent",
              }}
              data-ocid="landing.nav.mobile_menu_button"
            >
              <span
                className="block w-5 h-0.5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: "rgba(255,255,255,0.85)",
                  transform: mobileOpen
                    ? "translateY(4px) rotate(45deg)"
                    : "none",
                }}
              />
              <span
                className="block w-5 h-0.5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: "rgba(255,255,255,0.85)",
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                className="block w-5 h-0.5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: "rgba(255,255,255,0.85)",
                  transform: mobileOpen
                    ? "translateY(-4px) rotate(-45deg)"
                    : "none",
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div
            className="md:hidden flex flex-col gap-1 px-5 pb-4 pt-1"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              backgroundColor: "rgba(0, 24, 43, 0.95)",
              borderRadius: "0 0 12px 12px",
            }}
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  scrollToId(link.href.slice(1));
                }}
                className="text-left text-sm font-medium py-2.5 px-3 rounded-lg transition-colors duration-150"
                style={{
                  color: "rgba(255,255,255,0.82)",
                  fontFamily: "'Play', sans-serif",
                  background: "none",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                data-ocid={`landing.nav.mobile.${link.label.toLowerCase()}`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}

function NavLinkBtn({ label, targetId }: { label: string; targetId: string }) {
  return (
    <button
      type="button"
      onClick={() => scrollToId(targetId)}
      className="text-sm font-medium transition-colors duration-200"
      style={{
        color: "rgba(255,255,255,0.82)",
        fontFamily: "'Play', sans-serif",
        fontSize: "0.9rem",
        background: "none",
        border: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#ffffff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.82)";
      }}
      data-ocid={`landing.nav.${label.toLowerCase()}`}
    >
      {label}
    </button>
  );
}

function HeroSection({
  onLogin,
  isLoggingIn,
}: {
  onLogin: () => void;
  isLoggingIn: boolean;
}) {
  return (
    <section
      className="w-full pt-16 pb-10 md:pt-18 md:pb-14"
      style={{ backgroundColor: "#0A4A75" }}
      data-ocid="landing.hero.section"
    >
      <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-7">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit"
            style={{
              backgroundColor: "rgba(80,144,193,0.25)",
              color: "#5090C1",
              fontFamily: "'Play', sans-serif",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#5090C1] animate-pulse" />
            Swiss HR Software on the Internet Computer
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight"
            style={{ color: "#ffffff", fontFamily: "'Play', sans-serif" }}
          >
            Zeiterfassung &amp; HR für Schweizer Unternehmen
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Verwalte Arbeitszeiten, Spesen, Ferien und Mitarbeiterdaten –
            dezentral, sicher und direkt auf der Blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-bold text-base transition-all duration-200 disabled:opacity-60"
              style={{
                backgroundColor: "#5090C1",
                color: "#ffffff",
                fontFamily: "'Play', sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!isLoggingIn)
                  e.currentTarget.style.backgroundColor = "#1F6495";
              }}
              onMouseLeave={(e) => {
                if (!isLoggingIn)
                  e.currentTarget.style.backgroundColor = "#5090C1";
              }}
              data-ocid="landing.hero.login_button"
            >
              {isLoggingIn
                ? "Anmeldung läuft…"
                : "Anmelden mit Internet Identity"}
              {!isLoggingIn && <ChevronRight size={16} />}
            </button>
            <button
              type="button"
              onClick={() => scrollToId("funktionen")}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-base transition-all duration-200 border"
              style={{
                color: "rgba(255,255,255,0.85)",
                borderColor: "rgba(255,255,255,0.3)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              data-ocid="landing.hero.features_button"
            >
              Funktionen entdecken
            </button>
          </div>
        </div>
        <div className="relative flex justify-center md:justify-end">
          <div
            className="w-full max-w-[520px] rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: "#0A4A75",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)",
              minHeight: 320,
            }}
          >
            <img
              src="/assets/image-019d8d05-c956-7542-9dcf-ada97404d7da.png"
              alt="iReport HR Dashboard"
              style={{
                display: "block",
                objectFit: "contain",
                objectPosition: "center",
                width: "100%",
                height: "auto",
                maxHeight: 420,
                mixBlendMode: "screen",
                backgroundColor: "transparent",
              }}
            />
          </div>
          <div
            className="absolute -bottom-4 left-0 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "#ffffff",
              color: "#0A4A75",
              fontFamily: "'Play', sans-serif",
              boxShadow: "0 4px 14px rgba(10,74,117,0.18)",
            }}
          >
            ✓ Keine Installation nötig
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-6 mt-16">
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {TRUST_LABELS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(255,255,255,0.18)",
                fontFamily: "'Play', sans-serif",
              }}
            >
              <Icon size={15} style={{ color: "#5090C1" }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Carousel with horizontal scroll ─────────────────────────────────

function FeatureCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative px-8" data-ocid="landing.features.carousel">
      {/* Left arrow */}
      <button
        type="button"
        aria-label="Scroll links"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-150"
        style={{
          backgroundColor: canScrollLeft ? "#0A4A75" : "rgba(10,74,117,0.15)",
          color: canScrollLeft ? "#ffffff" : "rgba(10,74,117,0.30)",
          border: "none",
          pointerEvents: canScrollLeft ? "auto" : "none",
          opacity: canScrollLeft ? 1 : 0.4,
        }}
        tabIndex={canScrollLeft ? 0 : -1}
        data-ocid="landing.features.scroll_left"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-3"
        style={
          {
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties
        }
      >
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <Card
            key={title}
            className="border hover:shadow-lg transition-all duration-200 rounded-xl shrink-0"
            style={{
              borderColor: "rgba(10,74,117,0.10)",
              scrollSnapAlign: "start",
              width: "clamp(220px, 24vw, 260px)",
            }}
            data-ocid={`landing.features.item.${i + 1}`}
          >
            <CardContent className="p-6 flex flex-col gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(10,74,117,0.08)" }}
              >
                <Icon size={22} style={{ color: "#1F6495" }} />
              </div>
              <h3
                className="text-base font-bold"
                style={{ color: "#0A4A75", fontFamily: "'Play', sans-serif" }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#64748b" }}
              >
                {desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        aria-label="Scroll rechts"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-150"
        style={{
          backgroundColor: canScrollRight ? "#0A4A75" : "rgba(10,74,117,0.15)",
          color: canScrollRight ? "#ffffff" : "rgba(10,74,117,0.30)",
          border: "none",
          pointerEvents: canScrollRight ? "auto" : "none",
          opacity: canScrollRight ? 1 : 0.4,
        }}
        tabIndex={canScrollRight ? 0 : -1}
        data-ocid="landing.features.scroll_right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function FeatureGrid() {
  return (
    <section
      id="funktionen"
      className="w-full py-20 bg-white"
      data-ocid="landing.features.section"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "#0A4A75", fontFamily: "'Play', sans-serif" }}
          >
            Alles, was du brauchst
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#555e6e" }}>
            iReport deckt alle Bereiche der HR- und Zeiterfassung in einem
            einzigen System ab.
          </p>
        </div>
        <FeatureCarousel />
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section
      className="w-full py-20"
      style={{ backgroundColor: "#f4f7fb" }}
      data-ocid="landing.team.section"
    >
      <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "#0A4A75", fontFamily: "'Play', sans-serif" }}
          >
            Für moderne Teams
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#4a5568" }}>
            iReport unterstützt dein gesamtes Team – vom Mitarbeitenden bis zur
            Unternehmensleitung. Klare Rollenverteilung sorgt dafür, dass jeder
            nur das sieht, was er braucht.
          </p>
          <ul className="flex flex-col gap-3">
            {[
              "Rollenbasierter Zugriff: Admin, Manager, Mitarbeiter",
              "Ferien- und Spesenanträge mit digitalem Genehmigungsworkflow",
              "Auswertungen und Berichte für Führungskräfte",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm"
                style={{ color: "#4a5568" }}
              >
                <Check size={16} style={{ color: "#1F6495", flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        {/* Bild 2 – Für moderne Teams */}
        <div
          className="rounded-2xl overflow-hidden shadow-lg flex items-center justify-center"
          style={{ backgroundColor: "#f4f7fb", minHeight: 280 }}
        >
          <img
            src="/assets/image-019d8d05-c932-772f-bcd1-e76c16896a5d.png"
            alt="Team im Büro arbeitet mit iReport"
            style={{
              display: "block",
              objectFit: "contain",
              objectPosition: "center",
              width: "100%",
              height: "auto",
              maxHeight: 400,
              mixBlendMode: "multiply",
              backgroundColor: "transparent",
            }}
          />
        </div>
      </div>
    </section>
  );
}

function AvailabilitySection() {
  return (
    <section
      className="w-full py-20 bg-white"
      data-ocid="landing.availability.section"
    >
      <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Bild – Frau mit Tablet, "Überall verfügbar" */}
        <div
          className="flex items-center justify-center order-2 md:order-1 rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#ffffff", minHeight: 280 }}
        >
          <img
            src="/assets/woman-tablet-available.png"
            alt="iReport auf Tablet – überall verfügbar"
            style={{
              display: "block",
              objectFit: "contain",
              objectPosition: "center",
              width: "100%",
              height: "auto",
              maxHeight: 420,
              mixBlendMode: "multiply",
              backgroundColor: "transparent",
            }}
          />
        </div>
        <div className="flex flex-col gap-6 order-1 md:order-2">
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "#0A4A75", fontFamily: "'Play', sans-serif" }}
          >
            Überall verfügbar
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#4a5568" }}>
            iReport läuft direkt im Browser – auf dem Desktop, Tablet oder
            Smartphone. Keine App-Installation, keine Updates, keine
            Wartezeiten.
          </p>
          <ul className="flex flex-col gap-3">
            {[
              "Responsive Design für alle Bildschirmgrössen",
              "Funktioniert auf iOS, Android und Desktop",
              "Immer aktuell – kein manuelles Update nötig",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm"
                style={{ color: "#4a5568" }}
              >
                <Check size={16} style={{ color: "#1F6495", flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function NoInstallSection() {
  return (
    <section
      className="w-full py-20"
      style={{ backgroundColor: "#f4f7fb" }}
      data-ocid="landing.noinstall.section"
    >
      <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "#0A4A75", fontFamily: "'Play', sans-serif" }}
          >
            Keine Installation nötig
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "#4a5568" }}>
            iReport läuft vollständig im Browser. Kein App Store, kein Update,
            kein Wartungsfenster – starte sofort direkt über deinen Browser.
          </p>
          <ul className="flex flex-col gap-3">
            {[
              "Direkt im Browser öffnen – kein Download",
              "Automatisch immer auf dem neuesten Stand",
              "Funktioniert auf jedem Gerät",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm"
                style={{ color: "#4a5568" }}
              >
                <Check size={16} style={{ color: "#1F6495", flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "#f4f7fb", minHeight: 280 }}
        >
          <img
            src="/assets/image-019d8c2d-fdc1-741d-bb7a-04ed04e2c751.png"
            alt="iReport – Keine Installation nötig"
            style={{
              display: "block",
              objectFit: "contain",
              objectPosition: "center",
              width: "100%",
              height: "auto",
              maxHeight: 380,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <section
      className="w-full py-20 bg-white"
      data-ocid="landing.benefits.section"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "#0A4A75", fontFamily: "'Play', sans-serif" }}
          >
            Warum iReport?
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#555e6e" }}>
            Gebaut für die Anforderungen moderner Schweizer Unternehmen – mit
            den Vorteilen der Blockchain-Technologie.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(
            (
              { icon: Icon, title, desc, accentColor, accentLight, waveColor },
              i,
            ) => (
              <div
                key={title}
                className="relative flex flex-col overflow-hidden rounded-2xl shadow-lg"
                style={{
                  backgroundColor: "#fafcff",
                  border: "1px solid rgba(10,74,117,0.08)",
                }}
                data-ocid={`landing.benefits.item.${i + 1}`}
              >
                {/* Decorative wave */}
                <svg
                  className="absolute top-0 left-0 w-full"
                  height="54"
                  viewBox="0 0 300 54"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,0 L300,0 L300,30 Q225,54 150,38 Q75,22 0,46 Z"
                    fill={waveColor}
                  />
                </svg>
                <div className="relative z-10 flex flex-col gap-4 p-7 pt-10">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: accentLight }}
                  >
                    <Icon size={22} style={{ color: accentColor }} />
                  </div>
                  <h3
                    className="text-base font-bold"
                    style={{
                      color: "#0A4A75",
                      fontFamily: "'Play', sans-serif",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#64748b" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ),
          )}

          {/* 4th card — Onepager / Technologie */}
          <button
            type="button"
            className="relative flex flex-col overflow-hidden rounded-2xl shadow-lg cursor-pointer group text-left w-full"
            style={{
              backgroundColor: "#fafcff",
              border: "1px solid rgba(10,74,117,0.08)",
            }}
            onClick={() => setLightboxOpen(true)}
            data-ocid="landing.benefits.item.4"
            aria-label="Technologie-Onepager anzeigen"
          >
            {/* Decorative wave */}
            <svg
              className="absolute top-0 left-0 w-full"
              height="54"
              viewBox="0 0 300 54"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0,0 L300,0 L300,30 Q225,54 150,38 Q75,22 0,46 Z"
                fill="rgba(0,96,102,0.07)"
              />
            </svg>
            <div className="relative z-10 flex flex-col gap-3 p-7 pt-10">
              {/* Thumbnail */}
              <div
                className="w-full rounded-lg overflow-hidden shadow-sm ring-1 ring-black/5 group-hover:shadow-md transition-shadow duration-200"
                style={{ aspectRatio: "4/3", backgroundColor: "#e8f0f0" }}
              >
                <img
                  src="/assets/onepager_hreport_2.png"
                  alt="Technologie-Onepager Vorschau"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = "none";
                    const parent = el.parentElement;
                    if (parent && !parent.querySelector(".onepager-fallback")) {
                      const fb = document.createElement("div");
                      fb.className =
                        "onepager-fallback w-full h-full flex items-center justify-center text-sm font-semibold";
                      fb.style.color = "#006066";
                      fb.textContent = "Onepager";
                      parent.appendChild(fb);
                    }
                  }}
                />
              </div>
              <h3
                className="text-base font-bold"
                style={{ color: "#0A4A75", fontFamily: "'Play', sans-serif" }}
              >
                Technologie
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#64748b" }}
              >
                Erfahre mehr über die Technologie hinter iReport.
              </p>
              <span
                className="text-xs font-semibold mt-1"
                style={{ color: "#006066" }}
              >
                Onepager anzeigen &rarr;
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightboxOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setLightboxOpen(false);
          }}
          data-ocid="landing.benefits.onepager.dialog"
          aria-modal="true"
          aria-label="Technologie-Onepager"
        >
          <button
            type="button"
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            aria-label="Schliessen"
            data-ocid="landing.benefits.onepager.close_button"
          >
            <X size={20} style={{ color: "#fff" }} />
          </button>
          <img
            src="/assets/onepager_hreport_2.png"
            alt="Technologie-Onepager"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
          />
        </div>
      )}
    </section>
  );
}

function PricingSection({
  onRegister,
}: {
  onRegister: (planId: string, billing: string) => void;
}) {
  const { actor, isFetching } = useActor(createActor);
  const [billingMode, setBillingMode] = useState<"monatlich" | "jaehrlich">(
    "jaehrlich",
  );

  const FEATURE_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    "time-tracking": "Zeiterfassung",
    "expense-tracking": "Spesenerfassung",
    calendar: "Kalenderübersicht",
    reports: "Auswertungen",
    invoicing: "Fakturierung",
    "master-data": "Stammdaten",
    approvals: "Genehmigungen",
    "hr-compliance": "HR & Compliance",
    settings: "Einstellungen",
  };

  const { data: backendPlans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["publicSubscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        (await (
          actor as unknown as Record<string, () => Promise<SubscriptionPlan[]>>
        ).getSubscriptionPlans()) ?? []
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });

  type PricingCard = {
    id: string;
    tier: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    isFree: boolean;
    highlight: boolean;
    features: string[];
    cta: string;
  };

  // No fallback to static PRICING — if no active plans, show nothing
  const mappedPlans: PricingCard[] =
    backendPlans && backendPlans.length > 0
      ? backendPlans.map((plan) => {
          // Only include features that have a known label — skip raw keys without a mapping
          const featureLabels = plan.features
            .filter((k) => k in FEATURE_LABELS)
            .map((k) => FEATURE_LABELS[k]);
          const featureLabelsLower = featureLabels.map((l: string) =>
            l.toLowerCase().trim(),
          );
          const additionalDeduped = (plan.additionalFeatures ?? []).filter(
            (a: string) => !featureLabelsLower.includes(a.toLowerCase().trim()),
          );
          // Strict deduplication via Set so no label appears twice
          const allFeatures = [
            ...new Set(
              [...featureLabels, ...additionalDeduped]
                .map((t: string) => t.trim())
                .filter(Boolean),
            ),
          ];
          const isFree =
            plan.pricePerMonthCHF === 0 && plan.pricePerYearCHF === 0;
          return {
            id: plan.id,
            tier: plan.name,
            description: plan.description ?? "",
            priceMonthly: plan.pricePerMonthCHF,
            priceYearly: plan.pricePerYearCHF,
            isFree,
            highlight: plan.isRecommended ?? false,
            features: allFeatures,
            cta: "Jetzt starten",
          };
        })
      : [];

  const getPriceDisplay = (plan: PricingCard) => {
    if (plan.isFree) return { main: "Kostenlos", note: "Für immer gratis" };
    if (billingMode === "monatlich") {
      return {
        main: `CHF ${plan.priceMonthly.toFixed(2)}`,
        note: "pro Mitarbeiter / Monat im Monats-Abonnement",
      };
    }
    return {
      main: `CHF ${plan.priceYearly.toFixed(2)}`,
      note: "pro Mitarbeiter / Monat im Jahres-Abonnement",
    };
  };

  const handleCtaClick = (plan: PricingCard) => {
    onRegister(plan.id, billingMode === "jaehrlich" ? "yearly" : "monthly");
  };

  return (
    <section
      id="preise"
      className="w-full py-20"
      style={{ backgroundColor: "#f4f7fb" }}
      data-ocid="landing.pricing.section"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "#0A4A75", fontFamily: "'Play', sans-serif" }}
          >
            Einfache Preise
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#555e6e" }}>
            Transparent und fair – kein Kleingedrucktes, keine versteckten
            Gebühren.
          </p>
        </div>

        {/* Billing toggle — only shown when there are paid plans */}
        {!isLoading && mappedPlans.some((p) => !p.isFree) && (
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center rounded-xl p-1 gap-0.5"
              style={{
                backgroundColor: "#e2eaf2",
                border: "1px solid rgba(10,74,117,0.12)",
              }}
              aria-label="Abrechnungsmodell wählen"
            >
              <button
                type="button"
                onClick={() => setBillingMode("monatlich")}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor:
                    billingMode === "monatlich" ? "#ffffff" : "transparent",
                  color: billingMode === "monatlich" ? "#0A4A75" : "#6b7a8d",
                  boxShadow:
                    billingMode === "monatlich"
                      ? "0 1px 4px rgba(10,74,117,0.12)"
                      : "none",
                  fontFamily: "'Play', sans-serif",
                }}
                data-ocid="landing.pricing.billing_monthly_toggle"
              >
                Monatlich
              </button>
              <button
                type="button"
                onClick={() => setBillingMode("jaehrlich")}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor:
                    billingMode === "jaehrlich" ? "#ffffff" : "transparent",
                  color: billingMode === "jaehrlich" ? "#0A4A75" : "#6b7a8d",
                  boxShadow:
                    billingMode === "jaehrlich"
                      ? "0 1px 4px rgba(10,74,117,0.12)"
                      : "none",
                  fontFamily: "'Play', sans-serif",
                }}
                data-ocid="landing.pricing.billing_yearly_toggle"
              >
                Jährlich
                {billingMode === "jaehrlich" && (
                  <span
                    className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "#006066",
                      color: "#ffffff",
                    }}
                  >
                    Günstig
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-6 p-8 rounded-2xl border"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "rgba(10,74,117,0.12)",
                  minHeight: 360,
                }}
              >
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-3 w-full bg-slate-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : mappedPlans.length === 0 ? null : (
          <div
            className={`grid gap-8 max-w-3xl mx-auto ${
              mappedPlans.length === 1
                ? "md:grid-cols-1 max-w-sm"
                : "md:grid-cols-2"
            }`}
          >
            {mappedPlans.map((plan, i) => {
              const { main: priceMain, note: priceNote } =
                getPriceDisplay(plan);
              return (
                <div
                  key={plan.tier}
                  className="flex flex-col gap-5 p-8 rounded-2xl border"
                  style={{
                    backgroundColor: plan.highlight ? "#0A4A75" : "#ffffff",
                    borderColor: plan.highlight
                      ? "#0A4A75"
                      : "rgba(10,74,117,0.12)",
                    boxShadow: plan.highlight
                      ? "0 8px 24px rgba(10,74,117,0.25)"
                      : "0 1px 4px rgba(10,74,117,0.06)",
                  }}
                  data-ocid={`landing.pricing.item.${i + 1}`}
                >
                  {plan.highlight && (
                    <span
                      className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: "#5090C1",
                        color: "#ffffff",
                        fontFamily: "'Play', sans-serif",
                      }}
                    >
                      Empfohlen
                    </span>
                  )}
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{
                        color: plan.highlight
                          ? "rgba(255,255,255,0.65)"
                          : "#1F6495",
                        fontFamily: "'Play', sans-serif",
                      }}
                    >
                      {plan.tier}
                    </p>
                    <p
                      className="text-4xl font-bold"
                      style={{
                        color: plan.highlight ? "#ffffff" : "#0A4A75",
                        fontFamily: "'Play', sans-serif",
                      }}
                    >
                      {priceMain}
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{
                        color: plan.highlight
                          ? "rgba(255,255,255,0.55)"
                          : "#94a3b8",
                      }}
                    >
                      {priceNote}
                    </p>
                    {/* Plan description below price */}
                    {plan.description && (
                      <p
                        className="text-sm mt-2"
                        style={{
                          color: plan.highlight
                            ? "rgba(255,255,255,0.70)"
                            : "#4a5568",
                        }}
                      >
                        {plan.description}
                      </p>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2.5 text-sm"
                        style={{
                          color: plan.highlight
                            ? "rgba(255,255,255,0.85)"
                            : "#4a5568",
                        }}
                      >
                        <Check
                          size={14}
                          style={{
                            color: plan.highlight ? "#5090C1" : "#1F6495",
                            flexShrink: 0,
                          }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleCtaClick(plan)}
                    disabled={false}
                    className="w-full py-3 rounded-lg text-sm font-bold transition-all duration-200"
                    style={{
                      backgroundColor: plan.highlight
                        ? "#5090C1"
                        : "transparent",
                      color: plan.highlight ? "#ffffff" : "#0A4A75",
                      border: plan.highlight ? "none" : "2px solid #0A4A75",
                      fontFamily: "'Play', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      if (plan.highlight) {
                        e.currentTarget.style.backgroundColor = "#1F6495";
                      } else {
                        e.currentTarget.style.backgroundColor = "#0A4A75";
                        e.currentTarget.style.color = "#ffffff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.highlight) {
                        e.currentTarget.style.backgroundColor = "#5090C1";
                      } else {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#0A4A75";
                      }
                    }}
                    data-ocid={`landing.pricing.cta.${i + 1}`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section
      id="faq"
      className="w-full py-20 bg-white"
      data-ocid="landing.faq.section"
    >
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "#0A4A75", fontFamily: "'Play', sans-serif" }}
          >
            Häufige Fragen
          </h2>
          <p className="text-lg" style={{ color: "#555e6e" }}>
            Du hast Fragen? Wir haben Antworten.
          </p>
        </div>
        <Accordion type="single" collapsible className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="rounded-xl border px-6"
              style={{ borderColor: "rgba(10,74,117,0.12)" }}
              data-ocid={`landing.faq.item.${i + 1}`}
            >
              <AccordionTrigger
                className="text-left text-sm font-semibold py-4 hover:no-underline"
                style={{ color: "#0A4A75", fontFamily: "'Play', sans-serif" }}
              >
                {faq.q}
              </AccordionTrigger>
              <AccordionContent
                className="text-sm leading-relaxed pb-4"
                style={{ color: "#64748b" }}
              >
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FooterLink({
  href,
  external,
  ocid,
  children,
}: {
  href: string;
  external?: boolean;
  ocid: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-xs transition-colors duration-150"
      style={{ color: "rgba(255,255,255,0.65)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#ffffff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.65)";
      }}
      data-ocid={ocid}
    >
      {children}
    </a>
  );
}

function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="w-full py-10"
      style={{ backgroundColor: "#0A4A75" }}
      data-ocid="landing.footer"
    >
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <img
            src="/assets/logo_transparent.png"
            alt="iReport"
            style={{ height: "135px", width: "auto", marginBottom: "4px" }}
          />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            © {year} iServices AG · Schuppisstrasse 2 · 8057 Zürich
          </p>
        </div>
        <div className="flex items-center gap-6">
          <FooterLink
            href="/nutzungsbedingungen"
            ocid="landing.footer.nutzungsbedingungen_link"
          >
            Nutzungsbedingungen
          </FooterLink>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { identity, isLoggingIn: iiLoggingIn, login } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor(createActor);
  const { isAuthenticated, setAuthenticated, setLoading } = useAuthStore();
  const navigate = useNavigate();

  // Prevent double-initialization
  const isInitializing = useRef(false);

  // Show loading state on buttons while II popup is open OR session is being loaded
  const [sessionLoading, setSessionLoading] = useState(false);
  const isLoggingIn = iiLoggingIn || sessionLoading;

  // If already authenticated (e.g. returning user with persisted session),
  // redirect to dashboard immediately — don't show landing page.
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  // Core session initialization — runs after II resolves successfully.
  // Goes directly to /dashboard or /register, never to /login.
  const initializeSession = useCallback(async () => {
    if (!actor || isActorFetching || isInitializing.current) return;
    isInitializing.current = true;
    setSessionLoading(true);
    setLoading(true);

    try {
      const registered = (await toAny(actor).isRegistered()) as boolean;

      if (!registered) {
        // Unregistered users stay on the landing page so they can browse plans
        // and click "Jetzt starten" to begin registration.
        setLoading(false);
        setSessionLoading(false);
        isInitializing.current = false;
        return;
      }

      const [companyResult, employeeResult] = await Promise.all([
        toAny(actor).getMyCompany() as Promise<BackendResult<Company>>,
        toAny(actor).getMyEmployee() as Promise<BackendResult<Employee>>,
      ]);

      if (companyResult.__kind__ !== "ok" || employeeResult.__kind__ !== "ok") {
        throw new Error("Fehler beim Laden der Benutzerdaten");
      }

      const company = companyResult.ok;
      const employee = employeeResult.ok;
      const principal = identity?.getPrincipal().toString() ?? "";
      const appRole = employee.role as "admin" | "manager" | "employee";

      setAuthenticated(
        principal,
        appRole,
        String(company.id),
        String(employee.id),
        company.name,
        `${employee.firstName} ${employee.lastName}`,
        company.logoUrl ?? null,
      );

      setSessionLoading(false);
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("Fehler beim Laden der Benutzerdaten:", err);
      setLoading(false);
      setSessionLoading(false);
      isInitializing.current = false;
    }
  }, [
    actor,
    isActorFetching,
    identity,
    setAuthenticated,
    setLoading,
    navigate,
  ]);

  // Once II login succeeds AND actor is ready, initialize session.
  // We watch `identity` (stable after II resolves) + actor readiness instead of
  // the momentary `isLoginSuccess` flag — this avoids the race where the actor
  // isn't ready yet when isLoginSuccess briefly fires.
  useEffect(() => {
    if (
      identity &&
      actor &&
      !isActorFetching &&
      !isAuthenticated &&
      !isInitializing.current
    ) {
      void initializeSession();
    }
  }, [identity, actor, isActorFetching, isAuthenticated, initializeSession]);

  // Reset on identity loss (e.g. II cancelled or logged out)
  useEffect(() => {
    if (!identity) {
      isInitializing.current = false;
      setSessionLoading(false);
    }
  }, [identity]);

  const handleLogin = () => {
    // "Anmelden" triggers Internet Identity directly for existing users.
    // New users must register via "Jetzt starten" on the pricing section.
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
      return;
    }
    login();
  };

  const handleRegister = (planId: string, billing: string) => {
    navigate({
      to: "/register",
      search: { planId, billing },
    });
  };

  // Scroll to pricing section if ?scroll=pricing is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("scroll") === "pricing") {
      const el = document.getElementById("preise");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'Play', sans-serif", backgroundColor: "#0A4A75" }}
    >
      <LandingNav onLogin={handleLogin} isLoggingIn={isLoggingIn} />
      {/* pt-24 ensures content starts below the fixed floating nav (56px height + 16px top offset + 8px breathing room) */}
      <main className="flex-1 pt-24">
        <HeroSection onLogin={handleLogin} isLoggingIn={isLoggingIn} />
        <FeatureGrid />
        <TeamSection />
        <AvailabilitySection />
        <NoInstallSection />
        <BenefitsSection />
        <PricingSection onRegister={handleRegister} />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
