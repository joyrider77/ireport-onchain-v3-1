import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuthStore";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Image,
  Info,
  Layers,
  Lock,
  QrCode,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  Company,
  InvoiceTemplate,
  InvoiceTemplateInput,
} from "../../backend";
import { useActor, useMutation, useQuery, useQueryClient } from "./shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateForm {
  praefix: string;
  naechsteNummer: string;
  zahlungszielTage: string;
  mwstSatz: string;
  kopftext: string;
  fusstext: string;
  kopfzeilePosition: string;
  fusszeilePosition: string;
  kopfzeileBildUrl: string;
  kopfzeileBildPosition: string;
  fusszeileBildUrl: string;
  fusszeileBildPosition: string;
  bank: string;
  iban: string;
  mwstNummer: string;
  farbe: string;
  // QR fields
  qrAktivStandard: boolean;
  qrIban: string;
  qrKontoinhaber: string;
  qrKontoinhaberAdresse: string;
  qrWaehrung: string;
  qrReferenzPraefix: string;
  // Kopfbereich
  kopfzeileLogoQuelle: string;
  kopfzeileLogoGroesse: string;
  kopfzeileAdresse: string;
  kopfzeileAdressePosition: string;
  kopfzeileLayout: string;
  // Fussbereich
  fusszeileLayout: string;
  // Kundenadresse positioning (persisted to localStorage + backend)
  kundenadresseAbstandOben: number;
  kundenadresseEinrueckungZeichen: number;
  kundenadresseAbstandNach: number; // NEW: vertical spacing after address
}

const POSITION_OPTIONS = [
  { value: "links", label: "Links", icon: AlignLeft },
  { value: "zentriert", label: "Zentriert", icon: AlignCenter },
  { value: "rechts", label: "Rechts", icon: AlignRight },
];

const LOGO_GROESSE_OPTIONS = [
  { value: "small", label: "Klein (30px)" },
  { value: "medium", label: "Mittel (60px)" },
  { value: "large", label: "Gross (90px)" },
];

const LOGO_GROESSE_HEIGHT: Record<string, number> = {
  small: 30,
  medium: 60,
  large: 90,
};

function loadLS(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

const DEFAULT_FORM: TemplateForm = {
  praefix: "RE-",
  naechsteNummer: "1",
  zahlungszielTage: "30",
  kopftext:
    "Sehr geehrte Damen und Herren,\n\nWir erlauben uns, Ihnen folgende Leistungen in Rechnung zu stellen:",
  fusstext:
    "Bitte überweisen Sie den Betrag innerhalb von 30 Tagen.\n\nBank: [bank]\nIBAN: [iban]",
  kopfzeilePosition: "links",
  fusszeilePosition: "links",
  kopfzeileBildUrl: "",
  kopfzeileBildPosition: "links",
  fusszeileBildUrl: "",
  fusszeileBildPosition: "links",
  bank: "",
  iban: "",
  mwstNummer: "",
  farbe: "#006066",
  qrAktivStandard: false,
  qrIban: "",
  qrKontoinhaber: "",
  qrKontoinhaberAdresse: "",
  qrWaehrung: "CHF",
  qrReferenzPraefix: "",
  kopfzeileLogoQuelle: "stammdaten",
  kopfzeileLogoGroesse: "medium",
  kopfzeileAdresse: "",
  kopfzeileAdressePosition: "links",
  kopfzeileLayout: "nebeneinander",
  fusszeileLayout: "uebereinander",
  kundenadresseAbstandOben: 170,
  kundenadresseEinrueckungZeichen: 0,
  kundenadresseAbstandNach: 30,
  mwstSatz: "8.1",
};

function templateToForm(
  t: InvoiceTemplate,
  company?: Company | null,
): TemplateForm {
  return {
    praefix: t.praefix,
    naechsteNummer: String(t.naechsteNummer),
    zahlungszielTage: String(t.zahlungszielTage),
    kopftext: t.kopftext,
    fusstext: t.fusstext,
    kopfzeilePosition: t.kopfzeilePosition ?? "links",
    fusszeilePosition: t.fusszeilePosition ?? "links",
    kopfzeileBildUrl: t.kopfzeileBildUrl ?? "",
    kopfzeileBildPosition: t.kopfzeileBildPosition ?? "links",
    fusszeileBildUrl: t.fusszeileBildUrl ?? "",
    fusszeileBildPosition: t.fusszeileBildPosition ?? "links",
    bank: t.bank,
    iban: t.iban,
    mwstNummer: t.mwstNummer,
    farbe: t.farbe || "#006066",
    qrAktivStandard: t.qrAktivStandard ?? false,
    qrIban: t.qrIban ?? "",
    qrKontoinhaber: t.qrKontoinhaber ?? "",
    qrKontoinhaberAdresse: t.qrKontoinhaberAdresse ?? "",
    qrWaehrung: t.qrWaehrung ?? "CHF",
    qrReferenzPraefix: t.qrReferenzPraefix ?? "",
    kopfzeileLogoQuelle: t.kopfzeileLogoQuelle ?? "stammdaten",
    kopfzeileLogoGroesse: t.kopfzeileLogoGroesse ?? "medium",
    kopfzeileAdresse:
      t.kopfzeileAdresse ??
      (company ? `${company.name ?? ""}\n${company.address ?? ""}`.trim() : ""),
    kopfzeileAdressePosition: t.kopfzeileAdressePosition ?? "links",
    kopfzeileLayout: t.kopfzeileLayout ?? "nebeneinander",
    fusszeileLayout: t.fusszeileLayout ?? "uebereinander",
    kundenadresseAbstandOben:
      t.kundenadresseAbstandOben != null
        ? Number(t.kundenadresseAbstandOben)
        : Number(loadLS("rv_kundenadresse_abstand_oben", "170")) || 170,
    kundenadresseEinrueckungZeichen:
      t.kundenadresseEinrueckungZeichen != null
        ? Number(t.kundenadresseEinrueckungZeichen)
        : Number(loadLS("rv_kundenadresse_einrueckung_zeichen", "0")) || 0,
    kundenadresseAbstandNach:
      t.kundenadresseAbstandNach != null
        ? Number(t.kundenadresseAbstandNach)
        : Number(loadLS("rv_kundenadresse_abstand_nach", "30")) || 30,
    mwstSatz: loadLS("rv_mwst_satz_standard", "8.1"),
  };
}

function formToInput(f: TemplateForm): InvoiceTemplateInput {
  return {
    praefix: f.praefix,
    naechsteNummer: BigInt(Number(f.naechsteNummer) || 1),
    zahlungszielTage: BigInt(Number(f.zahlungszielTage) || 30),
    kopftext: f.kopftext,
    fusstext: f.fusstext,
    bank: f.bank,
    iban: f.iban,
    mwstNummer: f.mwstNummer,
    farbe: f.farbe,
    spalten: [],
    kopfzeilePosition: f.kopfzeilePosition || undefined,
    fusszeilePosition: f.fusszeilePosition || undefined,
    kopfzeileBildUrl: f.kopfzeileBildUrl || undefined,
    kopfzeileBildPosition: f.kopfzeileBildPosition || undefined,
    fusszeileBildUrl: f.fusszeileBildUrl || undefined,
    fusszeileBildPosition: f.fusszeileBildPosition || undefined,
    qrAktivStandard: f.qrAktivStandard,
    qrIban: f.qrIban || undefined,
    qrKontoinhaber: f.qrKontoinhaber || undefined,
    qrKontoinhaberAdresse: f.qrKontoinhaberAdresse || undefined,
    qrWaehrung: "CHF",
    qrReferenztyp: "NON",
    qrReferenzPraefix: f.qrReferenzPraefix || undefined,
    kopfzeileLogoQuelle: f.kopfzeileLogoQuelle || undefined,
    kopfzeileLogoGroesse: f.kopfzeileLogoGroesse || undefined,
    kopfzeileAdresse: f.kopfzeileAdresse || undefined,
    kopfzeileAdressePosition: f.kopfzeileAdressePosition || undefined,
    kopfzeileLayout: f.kopfzeileLayout || undefined,
    fusszeileLayout: f.fusszeileLayout || undefined,
    // All three spacing fields are stored in px directly (no mm conversion)
    kundenadresseAbstandOben: f.kundenadresseAbstandOben,
    kundenadresseEinrueckungZeichen: BigInt(
      f.kundenadresseEinrueckungZeichen || 0,
    ),
    kundenadresseAbstandNach: BigInt(f.kundenadresseAbstandNach || 0),
  };
}

function todayDE(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

// ─── Section Heading ──────────────────────────────────────────────────────────

interface SectionHeadingProps {
  number: number;
  title: string;
  description?: string;
}

function SectionHeading({ number, title, description }: SectionHeadingProps) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-border">
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs font-bold text-primary">{number}</span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Position Segmented Control ───────────────────────────────────────────────

interface PositionControlProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  id?: string;
}

function PositionControl({
  value,
  onChange,
  disabled,
  id,
}: PositionControlProps) {
  return (
    <div
      className="flex rounded-md border border-input overflow-hidden"
      id={id}
    >
      {POSITION_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        return (
          <label
            key={opt.value}
            title={opt.label}
            className={`flex-1 px-2 py-1.5 text-xs transition-colors cursor-pointer text-center select-none flex items-center justify-center gap-1
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${value === opt.value ? "bg-primary text-primary-foreground font-medium" : "bg-background text-muted-foreground hover:bg-muted"}`}
          >
            <input
              type="radio"
              name={id}
              value={opt.value}
              checked={value === opt.value}
              disabled={disabled}
              onChange={() => !disabled && onChange(opt.value)}
              className="sr-only"
            />
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Layout Toggle ────────────────────────────────────────────────────────────

interface LayoutToggleProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  id?: string;
}

function LayoutToggle({ value, onChange, disabled, id }: LayoutToggleProps) {
  return (
    <div
      className="flex rounded-md border border-input overflow-hidden"
      id={id}
    >
      <label
        className={`flex-1 px-3 py-1.5 text-xs transition-colors cursor-pointer text-center select-none flex items-center justify-center gap-1.5
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${value === "nebeneinander" ? "bg-primary text-primary-foreground font-medium" : "bg-background text-muted-foreground hover:bg-muted"}`}
      >
        <input
          type="radio"
          name={id}
          value="nebeneinander"
          checked={value === "nebeneinander"}
          disabled={disabled}
          onChange={() => !disabled && onChange("nebeneinander")}
          className="sr-only"
        />
        <Layers className="w-3 h-3 rotate-90" />
        Nebeneinander
      </label>
      <label
        className={`flex-1 px-3 py-1.5 text-xs transition-colors cursor-pointer text-center select-none flex items-center justify-center gap-1.5
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${value === "uebereinander" ? "bg-primary text-primary-foreground font-medium" : "bg-background text-muted-foreground hover:bg-muted"}`}
      >
        <input
          type="radio"
          name={id}
          value="uebereinander"
          checked={value === "uebereinander"}
          disabled={disabled}
          onChange={() => !disabled && onChange("uebereinander")}
          className="sr-only"
        />
        <Layers className="w-3 h-3" />
        Übereinander
      </label>
    </div>
  );
}

// ─── Image Upload Field ───────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  label: string;
  imageUrl: string;
  imagePosition: string;
  onImageChange: (url: string) => void;
  onPositionChange: (pos: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  ocidPrefix: string;
}

function ImageUploadField({
  label,
  imageUrl,
  imagePosition,
  onImageChange,
  onPositionChange,
  onRemove,
  disabled,
  ocidPrefix,
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      toast.error("Nur JPG oder PNG erlaubt");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onImageChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {imageUrl ? (
        <div className="flex items-start gap-2">
          <div className="w-20 h-12 border border-border rounded bg-muted/20 overflow-hidden flex-shrink-0">
            <img
              src={imageUrl}
              alt={label}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-1">
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => fileRef.current?.click()}
                data-ocid={`${ocidPrefix}-change`}
              >
                <Upload className="w-3 h-3" />
                Ändern
              </Button>
            )}
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                onClick={onRemove}
                data-ocid={`${ocidPrefix}-remove`}
              >
                <X className="w-3 h-3" />
                Entfernen
              </Button>
            )}
          </div>
        </div>
      ) : (
        !disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => fileRef.current?.click()}
            data-ocid={`${ocidPrefix}-upload`}
          >
            <Image className="w-3.5 h-3.5" />
            Bild hochladen
          </Button>
        )
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFile}
        aria-label={label}
      />
      {imageUrl && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Bildposition</Label>
          <PositionControl
            value={imagePosition}
            onChange={onPositionChange}
            disabled={disabled}
            id={`${ocidPrefix}-bild-position`}
          />
        </div>
      )}
    </div>
  );
}

// ─── Placeholder Chips ────────────────────────────────────────────────────────

const ALL_PLACEHOLDERS = [
  { key: "{{projekt_name}}", label: "Projektname" },
  { key: "{{projekt_kuerzel}}", label: "Projektkürzel" },
  { key: "{{mitarbeiter_name}}", label: "Mitarbeiter Name" },
  { key: "{{mitarbeiter_kuerzel}}", label: "Mitarbeiter Kürzel" },
  { key: "{{leistungsart}}", label: "Leistungsart" },
  { key: "{{zeitraum_von}}", label: "Zeitraum Von" },
  { key: "{{zeitraum_bis}}", label: "Zeitraum Bis" },
  { key: "{{total_stunden}}", label: "Total Stunden" },
  { key: "{{kunde_name}}", label: "Kundenname" },
  { key: "{{rechnungsnummer}}", label: "Rechnungsnummer" },
  { key: "{{rechnungsdatum}}", label: "Rechnungsdatum" },
  { key: "{{faelligkeitsdatum}}", label: "Fälligkeitsdatum" },
  { key: "[bank]", label: "Bank" },
  { key: "[iban]", label: "IBAN" },
];

function PlaceholderChips() {
  const [expanded, setExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function handleCopy(key: string) {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
        Verfügbare Platzhalter (zum Einfügen anklicken)
      </button>
      {expanded && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md border border-border">
          {ALL_PLACEHOLDERS.map((ph) => (
            <button
              key={ph.key}
              type="button"
              onClick={() => handleCopy(ph.key)}
              title={ph.key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-border text-xs text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors"
            >
              {copiedKey === ph.key ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
              <code className="text-[10px]">{ph.key}</code>
              <span className="text-[10px] text-muted-foreground">
                – {ph.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mini Invoice Preview ──────────────────────────────────────────────────────

interface PreviewProps {
  form: TemplateForm;
  company: Company | null | undefined;
}

function alignClass(pos: string): string {
  if (pos === "zentriert") return "text-center items-center";
  if (pos === "rechts") return "text-right items-end";
  return "text-left items-start";
}

function flexAlignClass(pos: string): string {
  if (pos === "zentriert") return "justify-center";
  if (pos === "rechts") return "justify-end";
  return "justify-start";
}

function InvoicePreview({ form, company }: PreviewProps) {
  const rechnungsNr = `${form.praefix}${String(form.naechsteNummer || 1).padStart(4, "0")}`;
  const accentColor = form.farbe || "#006066";
  const logoHeight = LOGO_GROESSE_HEIGHT[form.kopfzeileLogoGroesse] ?? 60;
  const headerLogoUrl =
    form.kopfzeileLogoQuelle === "upload"
      ? form.kopfzeileBildUrl
      : (company?.logoUrl ?? "");
  const isNebeneinander = form.kopfzeileLayout === "nebeneinander";
  const fussNebeneinander = form.fusszeileLayout === "nebeneinander";
  const fiktiveKundenadresse = "Max Muster AG\nMusterstrasse 1\n8000 Zürich";
  const einrueckung = form.kundenadresseEinrueckungZeichen;

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden text-xs font-mono">
      {/* Header */}
      <div
        className="p-4 border-b border-border"
        style={{ borderTopColor: accentColor, borderTopWidth: "3px" }}
      >
        {form.kopfzeileLogoQuelle !== "upload" && form.kopfzeileBildUrl && (
          <div
            className={`flex mb-2 ${flexAlignClass(form.kopfzeileBildPosition)}`}
          >
            <img
              src={form.kopfzeileBildUrl}
              alt="Kopfzeile Bild"
              className="max-h-10 object-contain"
            />
          </div>
        )}

        {isNebeneinander ? (
          <div className="flex items-start gap-3 mb-2">
            {headerLogoUrl ? (
              <img
                src={headerLogoUrl}
                alt="Logo"
                style={{ height: `${logoHeight * 0.4}px` }}
                className="object-contain flex-shrink-0"
              />
            ) : (
              <div
                className="rounded bg-muted/50 flex items-center justify-center flex-shrink-0"
                style={{
                  width: `${logoHeight * 0.4}px`,
                  height: `${logoHeight * 0.4}px`,
                }}
              >
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div
              className={`${alignClass(form.kopfzeileAdressePosition)} flex flex-col`}
            >
              {form.kopfzeileAdresse ? (
                <div className="text-[10px] text-foreground whitespace-pre-line leading-tight">
                  {form.kopfzeileAdresse}
                </div>
              ) : (
                <>
                  <div className="font-bold text-foreground text-sm">
                    {company?.name || "Firmenname"}
                  </div>
                  <div className="text-muted-foreground text-[10px] leading-tight">
                    {company?.address || "Firmenadresse"}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 mb-2">
            <div
              className={`flex ${flexAlignClass(form.kopfzeileAdressePosition)}`}
            >
              {headerLogoUrl ? (
                <img
                  src={headerLogoUrl}
                  alt="Logo"
                  style={{ height: `${logoHeight * 0.4}px` }}
                  className="object-contain"
                />
              ) : (
                <div
                  className="rounded bg-muted/50 flex items-center justify-center"
                  style={{
                    width: `${logoHeight * 0.4}px`,
                    height: `${logoHeight * 0.4}px`,
                  }}
                >
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className={alignClass(form.kopfzeileAdressePosition)}>
              {form.kopfzeileAdresse ? (
                <div className="text-[10px] text-foreground whitespace-pre-line leading-tight">
                  {form.kopfzeileAdresse}
                </div>
              ) : (
                <>
                  <div className="font-bold text-foreground text-sm">
                    {company?.name || "Firmenname"}
                  </div>
                  <div className="text-muted-foreground text-[10px] leading-tight">
                    {company?.address || "Firmenadresse"}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground space-y-0.5">
          {form.bank && <div>Bank: {form.bank}</div>}
          {form.iban && <div>IBAN: {form.iban}</div>}
          {form.mwstNummer && <div>MwSt-Nr: {form.mwstNummer}</div>}
        </div>
      </div>

      {/* Invoice Title */}
      <div className="px-4 pt-3 pb-2">
        <div className="font-bold text-sm" style={{ color: accentColor }}>
          Rechnung {rechnungsNr}
        </div>
        <div className="text-muted-foreground text-[10px]">
          Datum: {todayDE()}
        </div>
        {form.zahlungszielTage && (
          <div className="text-muted-foreground text-[10px]">
            Zahlungsziel: {form.zahlungszielTage} Tage
          </div>
        )}
      </div>

      {/* Kundenadresse — always shown in preview for positioning reference */}
      <div
        className="px-4"
        style={{
          paddingTop: `${form.kundenadresseAbstandOben || 10}px`,
          paddingBottom: `${form.kundenadresseAbstandNach || 10}px`,
          paddingLeft:
            einrueckung > 0 ? `${einrueckung * 0.55 + 1}rem` : undefined,
        }}
      >
        <div className="text-[9px] text-primary/70 border border-dashed border-primary/30 rounded px-1.5 py-1 inline-block whitespace-pre-line leading-tight">
          {fiktiveKundenadresse}
        </div>
        <div className="text-[8px] text-muted-foreground mt-0.5 italic">
          Kundenadresse · Abstand oben: {form.kundenadresseAbstandOben}px ·
          Abstand nach: {form.kundenadresseAbstandNach}px
        </div>
      </div>

      {/* Kopftext */}
      {form.kopftext && (
        <div
          className={`px-4 pb-2 text-[10px] text-foreground whitespace-pre-line leading-relaxed border-b border-border ${alignClass(form.kopfzeilePosition)}`}
        >
          {form.kopftext}
        </div>
      )}

      {/* Sample positions table */}
      <div className="px-4 py-2 overflow-x-auto">
        <table className="w-full text-[9px] border-collapse">
          <thead>
            <tr style={{ backgroundColor: `${accentColor}18` }}>
              <th className="text-left py-1 px-1 font-semibold text-foreground">
                Datum
              </th>
              <th className="text-left py-1 px-1 font-semibold text-foreground">
                Bezeichnung
              </th>
              <th className="text-right py-1 px-1 font-semibold text-foreground">
                Menge
              </th>
              <th className="text-left py-1 px-1 font-semibold text-foreground">
                Einheit
              </th>
              <th className="text-right py-1 px-1 font-semibold text-foreground">
                Preis CHF
              </th>
              <th className="text-right py-1 px-1 font-semibold text-foreground">
                Total CHF
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                datum: "01.04.2026",
                bezeichnung: "Beratung, Kickoff-Meeting",
                menge: "08:00",
                einheit: "Std.",
                preis: "120.00",
                total: "960.00",
              },
              {
                datum: "02.04.2026",
                bezeichnung: "Entwicklung, Feature-Umsetzung",
                menge: "04:00",
                einheit: "Std.",
                preis: "150.00",
                total: "600.00",
              },
            ].map((row) => (
              <tr
                key={row.datum + row.bezeichnung}
                className="border-b border-border/50"
              >
                <td className="py-0.5 px-1 text-muted-foreground">
                  {row.datum}
                </td>
                <td className="py-0.5 px-1">{row.bezeichnung}</td>
                <td className="py-0.5 px-1 text-right tabular-nums">
                  {row.menge}
                </td>
                <td className="py-0.5 px-1">{row.einheit}</td>
                <td className="py-0.5 px-1 text-right tabular-nums">
                  {row.preis}
                </td>
                <td className="py-0.5 px-1 text-right font-semibold">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: `${accentColor}12` }}>
              <td
                colSpan={5}
                className="py-1 px-1 text-right font-bold text-[10px]"
              >
                Total CHF
              </td>
              <td className="py-1 px-1 text-right font-bold text-[10px]">
                1'560.00
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Fusszeile */}
      {(form.fusstext || form.fusszeileBildUrl) && (
        <div className="border-t border-border">
          {fussNebeneinander ? (
            <div className="px-4 py-2 flex items-start gap-3">
              {form.fusstext && (
                <div
                  className={`flex-1 text-[9px] text-muted-foreground whitespace-pre-line leading-relaxed ${alignClass(form.fusszeilePosition)}`}
                >
                  {form.fusstext}
                </div>
              )}
              {form.fusszeileBildUrl && (
                <div
                  className={`flex ${flexAlignClass(form.fusszeileBildPosition)}`}
                >
                  <img
                    src={form.fusszeileBildUrl}
                    alt="Fusszeile"
                    className="max-h-8 object-contain"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-2 space-y-1.5">
              {form.fusstext && (
                <div
                  className={`text-[9px] text-muted-foreground whitespace-pre-line leading-relaxed ${alignClass(form.fusszeilePosition)}`}
                >
                  {form.fusstext}
                </div>
              )}
              {form.fusszeileBildUrl && (
                <div
                  className={`flex ${flexAlignClass(form.fusszeileBildPosition)}`}
                >
                  <img
                    src={form.fusszeileBildUrl}
                    alt="Fusszeile"
                    className="max-h-8 object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* QR Zahlschein Mockup */}
      {form.qrAktivStandard && (
        <div className="mx-4 mb-4 border border-border rounded overflow-hidden">
          <div className="text-[8px] font-semibold text-muted-foreground px-2 pt-1.5 pb-1 bg-muted/30 border-b border-border">
            QR-Rechnung / Zahlschein (Vorschau)
          </div>
          <div className="flex text-[8px]">
            <div className="w-1/3 border-r border-border p-2 space-y-1">
              <div className="font-bold text-[9px]">Empfangsschein</div>
              <div className="text-muted-foreground">Konto / Zahlbar an</div>
              <div className="font-mono text-[8px]">
                {form.qrIban || "CH56 0000 0000 0000 0000 0"}
              </div>
              <div className="text-muted-foreground">
                {form.qrKontoinhaber || company?.name || "Firmenname"}
              </div>
              <div className="mt-2 text-muted-foreground">Währung / Betrag</div>
              <div className="font-semibold">CHF 1'560.00</div>
            </div>
            <div className="flex-1 p-2 space-y-1">
              <div className="font-bold text-[9px]">Zahlteil</div>
              <div className="flex gap-2 items-start">
                <div className="w-12 h-12 border border-border rounded flex items-center justify-center bg-muted/20 flex-shrink-0">
                  <QrCode className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-muted-foreground">
                    Konto / Zahlbar an
                  </div>
                  <div className="font-mono text-[8px]">
                    {form.qrIban || "CH56 0000 0000 0000 0000 0"}
                  </div>
                  <div>
                    {form.qrKontoinhaber || company?.name || "Firmenname"}
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    Währung / Betrag
                  </div>
                  <div className="font-semibold">CHF 1'560.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function RechnungsvorlagenTab() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();

  const [form, setForm] = useState<TemplateForm>(DEFAULT_FORM);
  const [savedForm, setSavedForm] = useState<TemplateForm>(DEFAULT_FORM);

  const { data: templateResult, isLoading: templateLoading } = useQuery({
    queryKey: ["invoiceTemplate"],
    queryFn: async () => {
      if (!actor) return null;
      const res = await actor.getInvoiceTemplate();
      if (res.__kind__ === "err") return null;
      return res.ok ?? null;
    },
    enabled: !!actor && !isFetching,
  });

  const { data: company, isLoading: companyLoading } = useQuery<Company | null>(
    {
      queryKey: ["company"],
      queryFn: async () => {
        if (!actor) return null;
        const res = await actor.getMyCompany();
        if (res.__kind__ === "err") return null;
        return res.ok ?? null;
      },
      enabled: !!actor && !isFetching,
    },
  );

  useEffect(() => {
    if (templateResult) {
      const f = templateToForm(templateResult, company);
      setForm(f);
      setSavedForm(f);
    }
  }, [templateResult, company]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      try {
        localStorage.setItem(
          "rv_kundenadresse_abstand_oben",
          String(form.kundenadresseAbstandOben),
        );
        localStorage.setItem(
          "rv_kundenadresse_einrueckung_zeichen",
          String(form.kundenadresseEinrueckungZeichen),
        );
        localStorage.setItem(
          "rv_kundenadresse_abstand_nach",
          String(form.kundenadresseAbstandNach),
        );
        localStorage.setItem("rv_mwst_satz_standard", String(form.mwstSatz));
      } catch {
        /* ignore */
      }
      const input = formToInput(form);
      const res = await actor.createOrUpdateInvoiceTemplate(input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["invoiceTemplate"] });
      if (updated) {
        const f = templateToForm(updated as InvoiceTemplate, company);
        setSavedForm(f);
      }
      toast.success("Rechnungsvorlage gespeichert");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleReset() {
    setForm(savedForm);
  }

  const sf = (patch: Partial<TemplateForm>) =>
    setForm((f) => ({ ...f, ...patch }));

  if (templateLoading || companyLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!isAdmin && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
          <Lock className="w-4 h-4 flex-shrink-0" />
          Nur Admins können die Vorlage bearbeiten.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* ─── Left: Form (8 sections, ordered top-to-bottom per invoice layout) ─── */}
        <div className="space-y-4">
          {/* ── Section 1: Firmenlogo / Absenderbereich ── */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <SectionHeading
                number={1}
                title="Firmenlogo / Absenderbereich"
                description="Logo und Firmenadresse im Rechnungskopf"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo-Quelle */}
              <div className="space-y-1.5">
                <Label className="text-xs">Logo-Quelle</Label>
                <div className="flex rounded-md border border-input overflow-hidden">
                  {["stammdaten", "upload"].map((src) => (
                    <label
                      key={src}
                      className={`flex-1 px-3 py-1.5 text-xs transition-colors cursor-pointer text-center select-none flex items-center justify-center gap-1.5
                        ${!isAdmin ? "opacity-50 cursor-not-allowed" : ""}
                        ${form.kopfzeileLogoQuelle === src ? "bg-primary text-primary-foreground font-medium" : "bg-background text-muted-foreground hover:bg-muted"}`}
                    >
                      <input
                        type="radio"
                        name="rv-logo-quelle"
                        value={src}
                        checked={form.kopfzeileLogoQuelle === src}
                        disabled={!isAdmin}
                        onChange={() =>
                          isAdmin && sf({ kopfzeileLogoQuelle: src })
                        }
                        className="sr-only"
                      />
                      {src === "stammdaten" ? (
                        <Building2 className="w-3 h-3" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      {src === "stammdaten" ? "Aus Stammdaten" : "Eigenes Logo"}
                    </label>
                  ))}
                </div>
              </div>

              {/* Logo-Grösse */}
              <div className="space-y-1.5">
                <Label htmlFor="rv-logo-groesse" className="text-xs">
                  Logo-Grösse
                </Label>
                <Select
                  value={form.kopfzeileLogoGroesse}
                  onValueChange={(v) => sf({ kopfzeileLogoGroesse: v })}
                  disabled={!isAdmin}
                >
                  <SelectTrigger
                    id="rv-logo-groesse"
                    data-ocid="rv-logo-groesse"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOGO_GROESSE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Upload wenn "upload" */}
              {form.kopfzeileLogoQuelle === "upload" && (
                <ImageUploadField
                  label="Logo hochladen (JPG/PNG)"
                  imageUrl={form.kopfzeileBildUrl}
                  imagePosition={form.kopfzeileBildPosition}
                  onImageChange={(url) => sf({ kopfzeileBildUrl: url })}
                  onPositionChange={(pos) => sf({ kopfzeileBildPosition: pos })}
                  onRemove={() => sf({ kopfzeileBildUrl: "" })}
                  disabled={!isAdmin}
                  ocidPrefix="rv-kopf-logo"
                />
              )}

              {/* Vorschau aus Stammdaten */}
              {form.kopfzeileLogoQuelle === "stammdaten" && (
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border">
                  {company?.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt="Firmenlogo"
                      style={{
                        height: `${LOGO_GROESSE_HEIGHT[form.kopfzeileLogoGroesse] * 0.6}px`,
                      }}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Logo aus{" "}
                    <strong className="text-foreground">
                      Stammdaten › Firma
                    </strong>
                  </p>
                </div>
              )}

              <Separator />

              {/* Firmenadresse */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground">
                  Firmenadresse im Kopf
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rv-kopf-adresse" className="text-xs">
                      Adresstext
                    </Label>
                    {company && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        disabled={!isAdmin}
                        onClick={() =>
                          sf({
                            kopfzeileAdresse:
                              `${company.name ?? ""}\n${company.address ?? ""}`.trim(),
                          })
                        }
                      >
                        Aus Stammdaten übernehmen
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="rv-kopf-adresse"
                    data-ocid="rv-kopf-adresse"
                    value={form.kopfzeileAdresse}
                    onChange={(e) => sf({ kopfzeileAdresse: e.target.value })}
                    rows={4}
                    className="resize-none text-sm"
                    placeholder={`${company?.name ?? "Firmenname"}\nMusterstrasse 1\n8000 Zürich`}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Firma-Positionierung</Label>
                  <PositionControl
                    value={form.kopfzeileAdressePosition}
                    onChange={(v) => sf({ kopfzeileAdressePosition: v })}
                    disabled={!isAdmin}
                    id="rv-kopf-adresse-position"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Layout Logo + Adresse</Label>
                  <LayoutToggle
                    value={form.kopfzeileLayout}
                    onChange={(v) => sf({ kopfzeileLayout: v })}
                    disabled={!isAdmin}
                    id="rv-kopf-layout"
                  />
                </div>
              </div>

              {/* Separates Kopfzeilen-Bild */}
              {form.kopfzeileLogoQuelle === "stammdaten" && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">
                      Zusätzliches Kopfzeilen-Bild
                    </div>
                    <ImageUploadField
                      label="Bild (JPG/PNG)"
                      imageUrl={form.kopfzeileBildUrl}
                      imagePosition={form.kopfzeileBildPosition}
                      onImageChange={(url) => sf({ kopfzeileBildUrl: url })}
                      onPositionChange={(pos) =>
                        sf({ kopfzeileBildPosition: pos })
                      }
                      onRemove={() => sf({ kopfzeileBildUrl: "" })}
                      disabled={!isAdmin}
                      ocidPrefix="rv-kopf-bild"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── Section 2: Empfängerbereich / Kundenadresse ── */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <SectionHeading
                number={2}
                title="Empfängerbereich / Kundenadresse"
                description="Positionierung der Kundenadresse im Briefumschlag-Fenster"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rv-adresse-abstand" className="text-xs">
                    Abstand vom oberen Rand (px)
                  </Label>
                  <Input
                    id="rv-adresse-abstand"
                    data-ocid="rv-adresse-abstand"
                    type="number"
                    min={0}
                    max={600}
                    step={1}
                    value={form.kundenadresseAbstandOben}
                    onChange={(e) =>
                      sf({
                        kundenadresseAbstandOben: Number(e.target.value) || 0,
                      })
                    }
                    disabled={!isAdmin}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Vertikale Position in Pixeln (Fensterkuvert)
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rv-adresse-einrueckung" className="text-xs">
                    Einrückung links (px)
                  </Label>
                  <Input
                    id="rv-adresse-einrueckung"
                    data-ocid="rv-adresse-einrueckung"
                    type="number"
                    min={0}
                    max={400}
                    step={1}
                    value={form.kundenadresseEinrueckungZeichen}
                    onChange={(e) =>
                      sf({
                        kundenadresseEinrueckungZeichen:
                          Number(e.target.value) || 0,
                      })
                    }
                    disabled={!isAdmin}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Horizontale Einrückung in Pixeln
                  </p>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="rv-adresse-abstand-nach" className="text-xs">
                    Abstand nach Kundenadresse bis nächsten Textblock (px)
                  </Label>
                  <Input
                    id="rv-adresse-abstand-nach"
                    data-ocid="rv-adresse-abstand-nach"
                    type="number"
                    min={0}
                    max={400}
                    step={1}
                    value={form.kundenadresseAbstandNach}
                    onChange={(e) =>
                      sf({
                        kundenadresseAbstandNach: Number(e.target.value) || 0,
                      })
                    }
                    disabled={!isAdmin}
                    className="w-32"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Leerraum in Pixeln zwischen Kundenadresse und
                    Betreff/Rechnungstitel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Section 3: Rechnungskopf ── */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <SectionHeading
                number={3}
                title="Rechnungskopf"
                description="Nummerierung, Datum und Zahlungskonditionen"
              />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rv-praefix">Präfix</Label>
                <Input
                  id="rv-praefix"
                  data-ocid="rv-praefix"
                  value={form.praefix}
                  onChange={(e) => sf({ praefix: e.target.value })}
                  placeholder="RE-"
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rv-naechste">Nächste Nr.</Label>
                <Input
                  id="rv-naechste"
                  data-ocid="rv-naechste"
                  type="number"
                  min={1}
                  value={form.naechsteNummer}
                  onChange={(e) => sf({ naechsteNummer: e.target.value })}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rv-zahlungsziel">Zahlungsziel (Tage)</Label>
                <Input
                  id="rv-zahlungsziel"
                  data-ocid="rv-zahlungsziel"
                  type="number"
                  min={0}
                  value={form.zahlungszielTage}
                  onChange={(e) => sf({ zahlungszielTage: e.target.value })}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rv-farbe">Akzentfarbe</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="rv-farbe"
                    data-ocid="rv-farbe"
                    value={form.farbe}
                    onChange={(e) => sf({ farbe: e.target.value })}
                    disabled={!isAdmin}
                    className="w-9 h-9 rounded border border-input cursor-pointer p-0.5 bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Input
                    value={form.farbe}
                    onChange={(e) => sf({ farbe: e.target.value })}
                    placeholder="#006066"
                    disabled={!isAdmin}
                    className="w-28 font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Section 4: Kopftext / Betreff ── */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <SectionHeading
                number={4}
                title="Kopftext / Betreff"
                description="Anrede und Einleitung nach der Kundenadresse"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Textarea
                  id="rv-kopftext"
                  data-ocid="rv-kopftext"
                  value={form.kopftext}
                  onChange={(e) => sf({ kopftext: e.target.value })}
                  rows={4}
                  className="resize-none text-sm"
                  disabled={!isAdmin}
                />
                <PlaceholderChips />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Text-Positionierung</Label>
                <PositionControl
                  value={form.kopfzeilePosition}
                  onChange={(v) => sf({ kopfzeilePosition: v })}
                  disabled={!isAdmin}
                  id="rv-kopfzeile-position"
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Section 5: Leistungen & Spesen ── */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <SectionHeading
                number={5}
                title="Leistungen & Spesen"
                description="Standardwerte für Rechnungspositionen"
              />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="rv-mwst-satz">Standard MwSt.-Satz (%)</Label>
                <Input
                  id="rv-mwst-satz"
                  data-ocid="rv-mwst-satz"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={form.mwstSatz}
                  onChange={(e) => sf({ mwstSatz: e.target.value })}
                  placeholder="8.1"
                  disabled={!isAdmin}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Wird beim Erstellen neuer Rechnungsentwürfe automatisch
                  übernommen (pro Rechnung änderbar).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Section 6: Fusstext ── */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <SectionHeading
                number={6}
                title="Fusstext"
                description="Abschlusstext unter den Rechnungspositionen"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Textarea
                  id="rv-fusstext"
                  data-ocid="rv-fusstext"
                  value={form.fusstext}
                  onChange={(e) => sf({ fusstext: e.target.value })}
                  rows={5}
                  className="resize-none text-sm"
                  disabled={!isAdmin}
                />
                <PlaceholderChips />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Text-Positionierung</Label>
                <PositionControl
                  value={form.fusszeilePosition}
                  onChange={(v) => sf({ fusszeilePosition: v })}
                  disabled={!isAdmin}
                  id="rv-fusszeile-position"
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground">
                  Fusszeilen-Bild / Logo
                </div>
                <ImageUploadField
                  label="Bild (JPG/PNG)"
                  imageUrl={form.fusszeileBildUrl}
                  imagePosition={form.fusszeileBildPosition}
                  onImageChange={(url) => sf({ fusszeileBildUrl: url })}
                  onPositionChange={(pos) => sf({ fusszeileBildPosition: pos })}
                  onRemove={() => sf({ fusszeileBildUrl: "" })}
                  disabled={!isAdmin}
                  ocidPrefix="rv-fuss-bild"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Layout Text + Bild</Label>
                <LayoutToggle
                  value={form.fusszeileLayout}
                  onChange={(v) => sf({ fusszeileLayout: v })}
                  disabled={!isAdmin}
                  id="rv-fuss-layout"
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Section 7: Zahlungsdetails ── */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <SectionHeading
                number={7}
                title="Zahlungsdetails"
                description="Bankverbindung und MwSt.-Nummer für Rechnungsfuss"
              />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="rv-bank">Bank</Label>
                <Input
                  id="rv-bank"
                  data-ocid="rv-bank"
                  value={form.bank}
                  onChange={(e) => sf({ bank: e.target.value })}
                  placeholder="Zürcher Kantonalbank"
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rv-iban">IBAN</Label>
                <Input
                  id="rv-iban"
                  data-ocid="rv-iban"
                  value={form.iban}
                  onChange={(e) => sf({ iban: e.target.value })}
                  placeholder="CH56 0483 5012 3456 7800 9"
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rv-mwst">MwSt-Nummer</Label>
                <Input
                  id="rv-mwst"
                  data-ocid="rv-mwst"
                  value={form.mwstNummer}
                  onChange={(e) => sf({ mwstNummer: e.target.value })}
                  placeholder="CHE-123.456.789 MWST"
                  disabled={!isAdmin}
                />
              </div>

              {/* Read-only info from Stammdaten.Firma */}
              {company &&
                (company.taxId || company.name || company.address) && (
                  <div className="mt-1 p-3 rounded-lg bg-muted/40 border border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Aus Stammdaten.Firma
                      </p>
                      <a
                        href="/stammdaten?tab=firma"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        In Stammdaten bearbeiten
                      </a>
                    </div>
                    {company.taxId && (
                      <div className="text-xs text-foreground">
                        <span className="text-muted-foreground">MwSt-Nr.:</span>{" "}
                        {company.taxId}
                      </div>
                    )}
                    {company.name && (
                      <div className="text-xs text-foreground">
                        <span className="text-muted-foreground">
                          Konto-Inhaber:
                        </span>{" "}
                        {company.name}
                      </div>
                    )}
                    {company.address && (
                      <div className="text-xs text-foreground">
                        <span className="text-muted-foreground">
                          Konto-Adresse:
                        </span>{" "}
                        {company.address}
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground pt-0.5">
                      Diese Angaben werden aus den Firmenstammdaten übernommen
                      und stehen als Platzhalter [konto_inhaber] und
                      [konto_adresse] zur Verfügung.
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* ── Section 8: QR-Zahlschein ── */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <SectionHeading
                number={8}
                title="QR-Zahlschein"
                description="Schweizer QR-Rechnung nach SPS 2.0"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rv-qr-aktiv" className="text-sm font-medium">
                    QR-Code standardmässig aktivieren
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Neue Rechnungen erhalten automatisch einen QR-Zahlschein.
                  </p>
                </div>
                <Switch
                  id="rv-qr-aktiv"
                  data-ocid="rv-qr-aktiv"
                  checked={form.qrAktivStandard}
                  onCheckedChange={(v) => sf({ qrAktivStandard: v })}
                  disabled={!isAdmin}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="rv-qr-iban">IBAN</Label>
                  <Input
                    id="rv-qr-iban"
                    data-ocid="rv-qr-iban"
                    value={form.qrIban}
                    onChange={(e) => sf({ qrIban: e.target.value })}
                    placeholder="CH56 0483 5012 3456 7800 9"
                    disabled={!isAdmin}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="rv-qr-kontoinhaber">Kontoinhaber Name</Label>
                  <Input
                    id="rv-qr-kontoinhaber"
                    data-ocid="rv-qr-kontoinhaber"
                    value={form.qrKontoinhaber}
                    onChange={(e) => sf({ qrKontoinhaber: e.target.value })}
                    placeholder="Muster AG"
                    disabled={!isAdmin}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="rv-qr-adresse">Kontoinhaber Adresse</Label>
                  <Input
                    id="rv-qr-adresse"
                    data-ocid="rv-qr-adresse"
                    value={form.qrKontoinhaberAdresse}
                    onChange={(e) =>
                      sf({ qrKontoinhaberAdresse: e.target.value })
                    }
                    placeholder="Musterstrasse 1, 8000 Zürich"
                    disabled={!isAdmin}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Währung</Label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-muted/40 text-sm text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    CHF — fix (SPS 2.0)
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Referenztyp</Label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-muted/40 text-sm text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    NON — fix
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Der QR-Zahlschein erscheint im PDF immer auf einer separaten
                  Seite nach den Rechnungspositionen (Swiss Payment Standards
                  2.0). Währung und Referenztyp sind fix auf CHF / NON gesetzt.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          {isAdmin && (
            <div className="flex items-center gap-3 justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                data-ocid="rv-cancel"
                onClick={handleReset}
                disabled={saveMutation.isPending}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                data-ocid="rv-save"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          )}
        </div>

        {/* ─── Right: Live Preview ─── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="w-4 h-4 text-primary" />
            Vorschau
          </div>
          <div className="sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto rounded-lg">
            <InvoicePreview form={form} company={company} />
          </div>
        </div>
      </div>
    </div>
  );
}
