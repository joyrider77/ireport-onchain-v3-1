import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  FileText,
  Plus,
  Printer,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { createActor } from "../backend";
import type {
  Customer,
  Invoice,
  InvoicePosition,
  InvoicePositionInput,
  InvoiceTemplate,
  ProjectMemberAssignment,
} from "../backend";
import { InvoicePositionTyp, InvoiceStatus } from "../backend";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/useAuthStore";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function displayToISO(display: string): string {
  if (!display) return "";
  const parts = display.split(".");
  if (parts.length !== 3) return display;
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatAmount(n: number, currency = "CHF"): string {
  return `${currency}\u00A0${n.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatHoursHHMM(hours: number): string {
  const totalMins = Math.round(hours * 60);
  const hh = Math.floor(totalMins / 60);
  const mm = totalMins % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function alignClass(pos: string | undefined): string {
  if (pos === "center" || pos === "zentriert") return "text-center";
  if (pos === "right" || pos === "rechts") return "text-right";
  return "text-left";
}

function imgAlignClass(pos: string | undefined): string {
  if (pos === "center" || pos === "zentriert") return "mx-auto";
  if (pos === "right" || pos === "rechts") return "ml-auto";
  return "";
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  entwurf: "Entwurf",
  versendet: "Versendet",
  bezahlt: "Bezahlt",
  storniert: "Storniert",
  ueberfaellig: "Überfällig",
};

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  entwurf: "secondary",
  versendet: "default",
  bezahlt: "outline",
  storniert: "destructive",
  ueberfaellig: "orange",
};

// ─── Local types ─────────────────────────────────────────────────────────────

interface EditablePosition {
  id: string;
  typ: InvoicePositionTyp;
  referenzId?: bigint;
  bezeichnung: string;
  leistungsart?: string; // for Leistungen: prefixed in Bezeichnung column
  datum?: string; // ISO date for the entry
  von?: string; // Zeit-Block: Von-Zeit hh:mm
  bis?: string; // Zeit-Block: Bis-Zeit hh:mm
  menge: number;
  einheit: string;
  preis: number;
}

function posToInput(p: EditablePosition): InvoicePositionInput {
  // For Leistung positions: store the combined "Leistungsart - Beschreibung" as bezeichnung
  // so it displays correctly when the invoice is reloaded in edit mode.
  const storedBezeichnung =
    p.typ !== InvoicePositionTyp.spese && p.leistungsart
      ? p.bezeichnung
        ? `${p.leistungsart} - ${p.bezeichnung}`
        : p.leistungsart
      : p.bezeichnung;
  return {
    typ: p.typ,
    referenzId: p.referenzId,
    bezeichnung: storedBezeichnung,
    menge: p.menge,
    einheit: p.einheit,
    preis: p.preis,
  };
}
function invoicePositionToEditable(
  p: InvoicePosition,
  idx: number,
): EditablePosition {
  // When saving, posToInput stores "Leistungsart - Beschreibung" as the combined bezeichnung.
  // Parse it back so the preview renders correctly (leistungsart + bezeichnung parts).
  let leistungsart: string | undefined;
  let bezeichnung = p.bezeichnung;
  if (p.typ !== InvoicePositionTyp.spese && p.bezeichnung?.includes(" - ")) {
    const sepIdx = p.bezeichnung.indexOf(" - ");
    leistungsart = p.bezeichnung.slice(0, sepIdx);
    bezeichnung = p.bezeichnung.slice(sepIdx + 3);
  }
  return {
    id: `existing-${String(p.id)}-${idx}`,
    typ: p.typ,
    referenzId: p.referenzId,
    bezeichnung,
    leistungsart,
    // datum: not stored in backend — will be enriched by the time-entries query for edit mode
    menge: p.menge,
    einheit: p.einheit,
    preis: p.preis,
  };
}

let _localIdCounter = 0;
function newLocalId(): string {
  return `new-${++_localIdCounter}`;
}

// ─── QR Code hook ────────────────────────────────────────────────────────────

function useQRCode(data: string | null): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!data) {
      setDataUrl(null);
      return;
    }
    QRCode.toDataURL(data, {
      errorCorrectionLevel: "M",
      width: 256,
      margin: 1,
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [data]);
  return dataUrl;
}

// ─── Swiss QR Data Builder ───────────────────────────────────────────────────
// Strict SPS 2.0 — 32 lines, CRLF separator
// Reference: https://www.paymentstandards.ch/dam/downloads/ig-qr-bill-en.pdf

function buildSwissQRData(params: {
  iban: string;
  kontoinhaber: string;
  kontoinhaberAdresse: string;
  kundeNamen: string;
  kundeAdresse: string;
  betrag: number;
  waehrung: string;
  referenztyp: string;
  referenz: string;
  zusatz: string;
}): string {
  // Strip ALL spaces from IBAN (SPS 2.0 requires no spaces in QR payload)
  const rawIban = params.iban.replace(/\s/g, "");
  // Amount: always 2 decimal places, no thousand separator, no currency prefix
  const roundedBetrag = params.betrag.toFixed(2);
  const reftyp = (params.referenztyp || "NON").toUpperCase();
  const refNr = reftyp !== "NON" ? params.referenz || "" : "";

  // Split creditor address into street+number / PLZ+city lines
  const addrParts = params.kontoinhaberAdresse
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const creditorStreet = addrParts[0] || "";
  const creditorCity = addrParts.slice(1).join(" ").trim() || "";

  // Split debtor address: "Strasse 1, 8000 Zürich" → street, city
  const debtorParts = params.kundeAdresse
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const debtorStreet = debtorParts[0] || "";
  const debtorCity = debtorParts.slice(1).join(" ").trim() || "";

  // SPS 2.0 — exactly 32 lines, CRLF separated
  // Using "K" (combined) address type: line 7 = street+nr, line 8 = PLZ+city, lines 9-10 empty, line 11 = country
  const lines = [
    "SPC", // 1  – QR Type (literal)
    "0200", // 2  – Version (literal)
    "1", // 3  – Coding Type (1 = UTF-8)
    rawIban, // 4  – IBAN (no spaces)
    "K", // 5  – Creditor address type (K = combined)
    params.kontoinhaber, // 6  – Creditor name
    creditorStreet, // 7  – Creditor street + number
    creditorCity, // 8  – Creditor PLZ + city
    "", // 9  – (empty for K type)
    "", // 10 – (empty for K type)
    "CH", // 11 – Creditor country (ISO 3166-1 alpha-2)
    "", // 12 – Ultimate creditor type (always empty)
    "", // 13 – Ultimate creditor name (always empty)
    "", // 14 – Ultimate creditor street (always empty)
    "", // 15 – Ultimate creditor house nr (always empty)
    "", // 16 – Ultimate creditor PLZ (always empty)
    "", // 17 – Ultimate creditor city (always empty)
    "", // 18 – Ultimate creditor country (always empty)
    roundedBetrag, // 19 – Amount (2 decimal places, no separator)
    params.waehrung || "CHF", // 20 – Currency (CHF or EUR)
    "K", // 21 – Debtor address type (K = combined)
    params.kundeNamen, // 22 – Debtor name
    debtorStreet, // 23 – Debtor street + number
    debtorCity, // 24 – Debtor PLZ + city
    "", // 25 – (empty for K type)
    "", // 26 – (empty for K type)
    "CH", // 27 – Debtor country
    reftyp, // 28 – Reference type (NON / QRR / SCOR)
    refNr, // 29 – Reference number (empty if NON)
    params.zusatz || "", // 30 – Unstructured message (Rechnungsnummer)
    "EPD", // 31 – End Payment Data (literal)
    "", // 32 – Bill information (optional, empty)
  ];
  return lines.join("\r\n");
}

// ─── Placeholder context ─────────────────────────────────────────────────────

interface PlaceholderContext {
  projektName?: string;
  projektKuerzel?: string;
  bank?: string;
  iban?: string;
  mwstNummer?: string;
  kontoInhaber?: string;
  kontoAdresse?: string;
  rechnungsnummer?: string;
  datum?: string;
  faelligkeitsdatum?: string;
  kundenname?: string;
  // Extended placeholders
  mitarbeiterName?: string;
  mitarbeiterKuerzel?: string;
  leistungsart?: string;
  zeitraumVon?: string;
  zeitraumBis?: string;
  totalStunden?: string;
}

function replacePlaceholders(text: string, ctx: PlaceholderContext): string {
  if (!text) return "";
  // Guard-based replacement: only substitute a placeholder when the context value is
  // actually known (non-empty string). This prevents placeholders from being wiped out
  // with an empty string while data is still loading (e.g. bank/iban before template loads,
  // projekt_name before project list loads, kundenname before customer list loads).
  let result = text;

  // Conditional replacements — only when value is available
  if (ctx.projektName)
    result = result.replace(/\{\{projekt_name\}\}/g, ctx.projektName);
  if (ctx.projektKuerzel)
    result = result.replace(/\{\{projekt_kuerzel\}\}/g, ctx.projektKuerzel);
  if (ctx.bank) result = result.replace(/\[bank\]/g, ctx.bank);
  if (ctx.iban) result = result.replace(/\[iban\]/g, ctx.iban);
  if (ctx.mwstNummer) result = result.replace(/\[mwst_nr\]/g, ctx.mwstNummer);
  if (ctx.kontoInhaber)
    result = result.replace(/\[konto_inhaber\]/g, ctx.kontoInhaber);
  if (ctx.kontoAdresse)
    result = result.replace(/\[konto_adresse\]/g, ctx.kontoAdresse);
  if (ctx.kundenname) {
    result = result
      .replace(/\{\{kunde_name\}\}/g, ctx.kundenname)
      .replace(/\{\{kundenname\}\}/g, ctx.kundenname)
      .replace(/\[kundenname\]/g, ctx.kundenname);
  }
  if (ctx.rechnungsnummer) {
    result = result
      .replace(/\{\{rechnungsnummer\}\}/g, ctx.rechnungsnummer)
      .replace(/\[rechnungsnummer\]/g, ctx.rechnungsnummer);
  }
  if (ctx.datum) {
    result = result
      .replace(/\{\{rechnungsdatum\}\}/g, ctx.datum)
      .replace(/\[datum\]/g, ctx.datum);
  }
  if (ctx.faelligkeitsdatum) {
    result = result
      .replace(/\{\{faelligkeitsdatum\}\}/g, ctx.faelligkeitsdatum)
      .replace(/\[faelligkeitsdatum\]/g, ctx.faelligkeitsdatum);
  }

  // Unconditional replacements (empty string is acceptable for these)
  result = result
    .replace(/\{\{mitarbeiter_name\}\}/g, ctx.mitarbeiterName ?? "")
    .replace(/\{\{mitarbeiter_kuerzel\}\}/g, ctx.mitarbeiterKuerzel ?? "")
    .replace(/\{\{leistungsart\}\}/g, ctx.leistungsart ?? "")
    .replace(/\{\{zeitraum_von\}\}/g, ctx.zeitraumVon ?? "")
    .replace(/\{\{zeitraum_bis\}\}/g, ctx.zeitraumBis ?? "")
    .replace(/\{\{total_stunden\}\}/g, ctx.totalStunden ?? "");

  return result;
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function InvoiceEditorPage() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated, companyId, companyLogoUrl, companyName } = useAuth();
  const navigate = useNavigate();

  // Params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params = useParams({ strict: false }) as any;
  const invoiceId: string | undefined = params?.id;
  const isEditMode = !!invoiceId && invoiceId !== "neu";

  // Search params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const search = useSearch({ strict: false }) as any;
  const preSelectedTimeIds: bigint[] = useMemo(() => {
    if (!search?.zeitIds) return [];
    return String(search.zeitIds)
      .split(",")
      .filter(Boolean)
      .map((s: string) => BigInt(s));
  }, [search?.zeitIds]);
  const preSelectedExpenseIds: bigint[] = useMemo(() => {
    if (!search?.speseIds) return [];
    return String(search.speseIds)
      .split(",")
      .filter(Boolean)
      .map((s: string) => BigInt(s));
  }, [search?.speseIds]);

  // Pre-set kundeId from URL (for new invoices from selection)
  const urlKundeId: string = search?.kundeId ? String(search.kundeId) : "";

  // ── Data fetches ────────────────────────────────────────────────────────────

  const { data: customers = [], isLoading: customersLoading } = useQuery<
    Customer[]
  >({
    queryKey: ["customers", companyId],
    queryFn: async () => {
      if (!actor) return [];
      // listCustomers returns a plain Array<Customer> — no Result wrapper
      const res = (await toAny(actor).listCustomers()) as
        | Customer[]
        | { __kind__: string; ok?: Customer[] };
      if (Array.isArray(res)) return res;
      if (res && "ok" in res && res.ok) return res.ok;
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  const { data: template, isLoading: templateLoading } =
    useQuery<InvoiceTemplate | null>({
      queryKey: ["invoiceTemplate", companyId],
      queryFn: async () => {
        if (!actor) return null;
        const res = (await toAny(actor).getInvoiceTemplate()) as {
          __kind__: string;
          ok?: InvoiceTemplate | null;
        };
        if ("ok" in res) return res.ok ?? null;
        return null;
      },
      enabled: !!actor && !actorFetching && isAuthenticated,
    });

  const { data: existingInvoice, isLoading: invoiceLoading } =
    useQuery<Invoice | null>({
      queryKey: ["invoice", invoiceId],
      queryFn: async () => {
        if (!actor || !invoiceId) return null;
        const res = (await toAny(actor).getInvoiceById(BigInt(invoiceId))) as {
          __kind__: string;
          ok?: Invoice;
        };
        if ("ok" in res) return res.ok ?? null;
        return null;
      },
      enabled: !!actor && !actorFetching && isAuthenticated && isEditMode,
    });

  const { data: unbilledData } = useQuery<{
    spesen: Array<{
      id: bigint;
      description: string;
      reimbursementCHF: number;
      billableCHF: number;
      date: string;
      expenseTypeId: bigint;
      kundeId?: bigint;
      projektId?: bigint;
    }>;
    zeiteintraege: Array<{
      id: bigint;
      description: string;
      hours: number;
      billable: boolean;
      projectId: bigint;
      serviceTypeId: bigint;
      serviceTypeName?: string;
      date?: string;
      von?: string; // Zeit-Block Von hh:mm
      bis?: string; // Zeit-Block Bis hh:mm
    }>;
  } | null>({
    queryKey: [
      "unbilledForEditor",
      preSelectedTimeIds.join(","),
      preSelectedExpenseIds.join(","),
    ],
    queryFn: async () => {
      if (!actor) return null;
      const res = (await toAny(actor).getUnbilledEntries(null)) as {
        __kind__: string;
        ok?: { spesen: unknown[]; zeiteintraege: unknown[] };
      };
      if ("ok" in res) return res.ok as typeof unbilledData;
      return null;
    },
    enabled:
      !!actor &&
      !actorFetching &&
      isAuthenticated &&
      !isEditMode &&
      (preSelectedTimeIds.length > 0 || preSelectedExpenseIds.length > 0),
  });

  const {
    data: projectMembersMap = new Map<string, ProjectMemberAssignment[]>(),
  } = useQuery<Map<string, ProjectMemberAssignment[]>>({
    queryKey: ["projectMembersForEditor", companyId],
    queryFn: async () => {
      if (!actor) return new Map();
      const projectIds = [
        ...(unbilledData?.zeiteintraege.map((z) => z.projectId) ?? []),
      ];
      const unique = [...new Set(projectIds.map(String))];
      const result = new Map<string, ProjectMemberAssignment[]>();
      await Promise.all(
        unique.map(async (pid) => {
          try {
            const res = (await toAny(actor).getProjectMembers(BigInt(pid))) as {
              __kind__: string;
              ok?: ProjectMemberAssignment[];
            };
            if (res.__kind__ === "ok" && res.ok) result.set(pid, res.ok);
          } catch {
            /* ignore */
          }
        }),
      );
      return result;
    },
    enabled:
      !!actor &&
      !actorFetching &&
      isAuthenticated &&
      !isEditMode &&
      !!unbilledData,
  });

  // Fetch service types to resolve leistungsart names for positions
  const { data: allServiceTypes = [] } = useQuery<
    Array<{ id: bigint; name: string }>
  >({
    queryKey: ["serviceTypesForEditor", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // listServiceTypes returns a plain Array<ServiceType> — no Result wrapper
        const res = (await toAny(actor).listServiceTypes()) as
          | Array<{ id: bigint; name: string }>
          | { __kind__: string; ok?: Array<{ id: bigint; name: string }> };
        if (Array.isArray(res)) return res;
        if (res && "ok" in res && res.ok) return res.ok;
      } catch {
        /* ignore */
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  // Fetch expense types to resolve spesenart names for spesen positions
  const { data: allExpenseTypes = [] } = useQuery<
    Array<{ id: bigint; name: string }>
  >({
    queryKey: ["expenseTypesForEditor", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // listExpenseTypes returns a plain Array<ExpenseType> — no Result wrapper
        const res = (await toAny(actor).listExpenseTypes()) as
          | Array<{ id: bigint; name: string }>
          | { __kind__: string; ok?: Array<{ id: bigint; name: string }> };
        if (Array.isArray(res)) return res;
        if (res && "ok" in res && res.ok) return res.ok;
      } catch {
        try {
          // Fallback: try listSpesenarten (older backend API)
          const res2 = (await toAny(actor).listSpesenarten()) as
            | Array<{ id: bigint; name: string }>
            | { __kind__: string; ok?: Array<{ id: bigint; name: string }> };
          if (Array.isArray(res2)) return res2;
          if (res2 && "ok" in res2 && res2.ok) return res2.ok;
        } catch {
          /* ignore */
        }
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  // ── In edit mode: fetch time entries referenced by positions to get datum + leistungsart ─────
  // We use a broad fetch and then filter by referenzId to enrich positions loaded from backend.
  const { data: editModeTimeEntries = [] } = useQuery<
    Array<{
      id: bigint;
      date: string;
      von?: string;
      bis?: string;
      description: string;
      serviceTypeId: bigint;
      projectId: bigint;
    }>
  >({
    queryKey: ["editModeTimeEntries", companyId, invoiceId],
    queryFn: async () => {
      if (!actor || !isEditMode) return [];
      try {
        // listTimeEntries returns a plain Array<TimeEntry> — no Result wrapper
        const res = (await toAny(actor).listTimeEntries({})) as
          | Array<{
              id: bigint;
              date: string;
              von?: string;
              bis?: string;
              description: string;
              serviceTypeId: bigint;
              projectId: bigint;
            }>
          | unknown;
        if (Array.isArray(res)) return res;
      } catch {
        return [];
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isEditMode,
  });

  // ── Form state ──────────────────────────────────────────────────────────────
  const [kundeId, setKundeId] = useState<string>("");
  const [rechnungsnummer, setRechnungsnummer] = useState<string>("");
  const [datum, setDatum] = useState<string>(isoToDisplay(todayISO()));
  const [faelligkeitsdatum, setFaelligkeitsdatum] = useState<string>("");
  const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.entwurf);
  const [positions, setPositions] = useState<EditablePosition[]>([]);
  const [rabatt, setRabatt] = useState<string>("0");
  const [skonto, setSkonto] = useState<string>("0");
  const [mwstSatz, setMwstSatz] = useState<string>("7.7");
  const [kopftext, setKopftext] = useState<string>("");
  const [fusstext, setFusstext] = useState<string>("");
  const [qrAktiv, setQrAktiv] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingVersendet, setIsMarkingVersendet] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const isMountedRef = useRef(false);

  // Guard: nur State-Updates nach vollständigem Mount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Dynamic document title for PDF file naming
  useEffect(() => {
    const originalTitle = document.title;
    if (rechnungsnummer) {
      document.title = `Rechnung ${rechnungsnummer}`;
    }
    return () => {
      document.title = originalTitle;
    };
  }, [rechnungsnummer]);

  // Derived
  const selectedCustomer = customers.find((c) => String(c.id) === kundeId);
  const waehrung = selectedCustomer?.waehrung ?? "CHF";

  // Computed rechnungsnummer from template
  // Use praefix and naechsteNummer directly from template — backend handles formatting
  const computedRechnungsnummer = useMemo(() => {
    if (!template) return "RE-0001";
    const num = String(template.naechsteNummer).padStart(4, "0");
    const praefix = template.praefix || "RE-";
    return `${praefix}${num}`;
  }, [template]);

  // ── Initialize form ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (initializedRef.current) return;
    if (templateLoading || customersLoading) return;
    if (isEditMode && invoiceLoading) return;
    if (isEditMode && !existingInvoice) return;

    initializedRef.current = true;

    if (isEditMode && existingInvoice) {
      setKundeId(String(existingInvoice.kundeId));
      // Use rechnungsnummer as-is from backend (backend now handles correct formatting)
      setRechnungsnummer(existingInvoice.rechnungsnummer);
      setDatum(isoToDisplay(existingInvoice.datum));
      setFaelligkeitsdatum(isoToDisplay(existingInvoice.faelligkeitsdatum));
      setStatus(existingInvoice.status);
      setPositions(existingInvoice.positionen.map(invoicePositionToEditable));
      setRabatt(String(existingInvoice.rabatt));
      setSkonto(String(existingInvoice.skonto));
      setMwstSatz(String(existingInvoice.mwstSatz));
      setKopftext(existingInvoice.kopftext);
      setFusstext(existingInvoice.fusstext);
      setQrAktiv(template?.qrAktivStandard ?? false);
    } else {
      // New invoice — apply ALL template settings
      setRechnungsnummer(computedRechnungsnummer);
      if (urlKundeId) setKundeId(urlKundeId);

      if (template) {
        setKopftext(template.kopftext || "");
        setFusstext(template.fusstext || "");
        setQrAktiv(template.qrAktivStandard ?? false);
        // Read mwstSatz default from localStorage (saved by RechnungsvorlagenTab)
        try {
          const savedMwst = localStorage.getItem("rv_mwst_satz_standard");
          if (savedMwst) setMwstSatz(savedMwst);
        } catch {
          /* ignore */
        }
        const days = Number(template.zahlungszielTage) || 30;
        setFaelligkeitsdatum(isoToDisplay(addDays(todayISO(), days)));
      } else {
        setFaelligkeitsdatum(isoToDisplay(addDays(todayISO(), 30)));
      }
    }
  }, [
    isEditMode,
    existingInvoice,
    template,
    templateLoading,
    customersLoading,
    invoiceLoading,
    computedRechnungsnummer,
    urlKundeId,
  ]);

  // Populate positions from pre-selected entries
  useEffect(() => {
    if (isEditMode) return;
    if (!unbilledData) return;
    if (preSelectedTimeIds.length === 0 && preSelectedExpenseIds.length === 0)
      return;

    const newPositions: EditablePosition[] = [];

    for (const te of unbilledData?.zeiteintraege ?? []) {
      if (!preSelectedTimeIds.includes(te.id)) continue;
      const members = projectMembersMap.get(String(te.projectId)) ?? [];
      const assignment = members.find(
        (m) => String(m.serviceTypeId) === String(te.serviceTypeId),
      );
      const stundensatz = assignment?.stundensatz ?? 0;
      // Look up service type name from the fetched service types
      const serviceType = allServiceTypes.find(
        (st) => String(st.id) === String(te.serviceTypeId),
      );
      newPositions.push({
        id: newLocalId(),
        typ: InvoicePositionTyp.leistung,
        referenzId: te.id,
        bezeichnung: te.description || "",
        leistungsart: serviceType?.name || "",
        datum: te.date || "",
        von: te.von || undefined,
        bis: te.bis || undefined,
        menge: te.hours,
        einheit: "Std.",
        preis: stundensatz,
      });
    }

    for (const ex of unbilledData?.spesen ?? []) {
      if (!preSelectedExpenseIds.includes(ex.id)) continue;
      const betrag = ex.billableCHF ?? ex.reimbursementCHF ?? 0;
      // Look up expense type name
      const expenseType = allExpenseTypes.find(
        (et) => String(et.id) === String(ex.expenseTypeId),
      );
      const spesenartName = expenseType?.name || "";
      const spesenBezeichnung = spesenartName
        ? ex.description
          ? `${spesenartName} - ${ex.description}`
          : spesenartName
        : ex.description || "Spese";
      newPositions.push({
        id: newLocalId(),
        typ: InvoicePositionTyp.spese,
        referenzId: ex.id,
        bezeichnung: spesenBezeichnung,
        datum: ex.date || "",
        menge: 1,
        einheit: "Pauschal",
        preis: betrag,
      });
    }

    if (newPositions.length > 0 && isMountedRef.current)
      setPositions(newPositions);
  }, [
    unbilledData,
    projectMembersMap,
    allServiceTypes,
    allExpenseTypes,
    isEditMode,
    preSelectedTimeIds,
    preSelectedExpenseIds,
  ]);

  // ── Edit mode: enrich positions with datum + leistungsart from fetched time entries ──────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isEditMode) return;
    if (editModeTimeEntries.length === 0) return;

    setPositions((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((p) => {
        if (p.typ === InvoicePositionTyp.spese) return p;
        if (!p.referenzId) return p;
        const te = editModeTimeEntries.find(
          (e) => String(e.id) === String(p.referenzId),
        );
        if (!te) return p;
        const serviceType = allServiceTypes.find(
          (st) => String(st.id) === String(te.serviceTypeId),
        );
        return {
          ...p,
          datum: p.datum || te.date || "",
          von: p.von || te.von || undefined,
          bis: p.bis || te.bis || undefined,
          leistungsart: p.leistungsart || serviceType?.name || "",
        };
      });
    });
    // editModeTimeEntries and allServiceTypes are the only real triggers —
    // positions is read via functional update so it's excluded from deps intentionally
  }, [editModeTimeEntries, allServiceTypes, isEditMode]);
  // note: positions intentionally omitted from deps to avoid infinite loop

  // ── Edit mode: fetch expense entries to enrich spesen positions with spesenart name ──
  const { data: editModeExpenseEntries = [] } = useQuery<
    Array<{
      id: bigint;
      expenseTypeId?: bigint;
      spesenartId?: bigint;
      description: string;
      date: string;
    }>
  >({
    queryKey: ["editModeExpenseEntries", companyId, invoiceId],
    queryFn: async () => {
      if (!actor || !isEditMode) return [];
      try {
        // listExpenses returns a plain Array<Expense> — no Result wrapper
        const res = (await toAny(actor).listExpenses({})) as
          | Array<{
              id: bigint;
              expenseTypeId?: bigint;
              spesenartId?: bigint;
              description: string;
              date: string;
            }>
          | unknown;
        if (Array.isArray(res)) return res;
      } catch {
        try {
          const res2 = (await toAny(actor).listSpesen({})) as
            | Array<{
                id: bigint;
                expenseTypeId?: bigint;
                spesenartId?: bigint;
                description: string;
                date: string;
              }>
            | unknown;
          if (Array.isArray(res2)) return res2;
        } catch {
          return [];
        }
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated && isEditMode,
  });

  // ── Edit mode: enrich spesen positions with spesenart name ──────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isEditMode) return;
    if (allExpenseTypes.length === 0 && editModeExpenseEntries.length === 0)
      return;

    setPositions((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((p) => {
        if (p.typ !== InvoicePositionTyp.spese) return p;
        if (!p.referenzId) return p;
        // Find the expense entry to get date and expenseTypeId
        const expEntry = editModeExpenseEntries.find(
          (e) => String(e.id) === String(p.referenzId),
        );
        const typeId = expEntry?.expenseTypeId ?? expEntry?.spesenartId;
        // Enrich datum regardless of whether bezeichnung is already formatted
        const newDatum = p.datum || expEntry?.date || "";
        const datumChanged = newDatum !== p.datum;

        // Only enrich bezeichnung if it doesn't already contain " - "
        const alreadyEnriched = p.bezeichnung?.includes(" - ");
        if (alreadyEnriched && !datumChanged) return p;

        if (alreadyEnriched && datumChanged) {
          changed = true;
          return { ...p, datum: newDatum };
        }

        // Need to enrich bezeichnung
        if (!typeId) {
          if (datumChanged) {
            changed = true;
            return { ...p, datum: newDatum };
          }
          return p;
        }
        const expenseType = allExpenseTypes.find(
          (et) => String(et.id) === String(typeId),
        );
        if (!expenseType) {
          if (datumChanged) {
            changed = true;
            return { ...p, datum: newDatum };
          }
          return p;
        }
        const enriched = {
          ...p,
          bezeichnung: p.bezeichnung
            ? `${expenseType.name} - ${p.bezeichnung}`
            : expenseType.name,
          datum: newDatum,
        };
        changed = true;
        return enriched;
      });
      return changed ? next : prev;
    });
  }, [editModeExpenseEntries, allExpenseTypes, isEditMode]);

  // ── Calculations ────────────────────────────────────────────────────────────

  const zwischensumme = positions.reduce((s, p) => s + p.menge * p.preis, 0);
  const rabattNum = Number.parseFloat(rabatt) || 0;
  const skontoNum = Number.parseFloat(skonto) || 0;
  const mwstNum = Number.parseFloat(mwstSatz) || 0;
  const nettoBase = zwischensumme - rabattNum - skontoNum;
  const mwstBetrag = (nettoBase * mwstNum) / 100;
  const total = nettoBase + mwstBetrag;

  // Rounded total for QR (2 decimal places)
  const totalRounded = Math.round(total * 100) / 100;

  // ── Company data ─────────────────────────────────────────────────────────────

  const [companyData, setCompanyData] = useState<{
    address?: string;
    taxId?: string;
  } | null>(null);

  useEffect(() => {
    if (!actor || actorFetching) return;
    toAny(actor)
      .getMyCompany()
      .then((res) => {
        if (!isMountedRef.current) return;
        const r = res as {
          __kind__: string;
          ok?: { address?: string; taxId?: string };
        };
        if ("ok" in r && r.ok) setCompanyData(r.ok);
      })
      .catch(() => {});
  }, [actor, actorFetching]);

  // Fetch all employees to resolve mitarbeiter_name placeholder
  const { data: allEmployees = [] } = useQuery<
    Array<{ id: bigint; firstName: string; lastName: string; kuerzel?: string }>
  >({
    queryKey: ["employeesForEditor", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const res = (await toAny(actor).listEmployees()) as
          | Array<{
              id: bigint;
              firstName: string;
              lastName: string;
              kuerzel?: string;
            }>
          | unknown;
        if (Array.isArray(res)) return res;
      } catch {
        /* ignore */
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  // ── Placeholder context ────────────────────────────────────────────────────

  // Fetch projects to resolve projekt_name and projekt_kuerzel from positions
  const { data: allProjects = [] } = useQuery<
    Array<{
      id: bigint;
      name: string;
      kuerzel?: string;
      kurzbezeichnung?: string;
    }>
  >({
    queryKey: ["projectsForPlaceholders", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // listProjects returns a plain Array<Project> — no Result wrapper
        const res = (await toAny(actor).listProjects()) as
          | Array<{
              id: bigint;
              name: string;
              kuerzel?: string;
              kurzbezeichnung?: string;
            }>
          | {
              __kind__: string;
              ok?: Array<{
                id: bigint;
                name: string;
                kuerzel?: string;
                kurzbezeichnung?: string;
              }>;
            };
        if (Array.isArray(res)) return res;
        if (res && "ok" in res && res.ok) return res.ok;
      } catch {
        /* ignore */
      }
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });

  // First project ID from positions — works in both new and edit mode
  const firstProjektId = useMemo(() => {
    if (isEditMode) {
      // In edit mode: find the first Leistung position with a referenzId, look up its projectId from fetched time entries
      const firstLeistungPos = positions.find(
        (p) => p.typ !== InvoicePositionTyp.spese && p.referenzId,
      );
      if (firstLeistungPos?.referenzId) {
        const te = editModeTimeEntries.find(
          (e) => String(e.id) === String(firstLeistungPos.referenzId),
        );
        if (te) return String(te.projectId);
      }
      return "";
    }
    // New mode: first try time entries, then fall back to spesen projektId
    const firstTime = (unbilledData?.zeiteintraege ?? []).find((z) =>
      preSelectedTimeIds.includes(z.id),
    );
    if (firstTime) return String(firstTime.projectId);
    // Fallback: look for projektId in pre-selected spesen
    const firstSpese = (unbilledData?.spesen ?? []).find(
      (s) => preSelectedExpenseIds.includes(s.id) && s.projektId,
    );
    if (firstSpese?.projektId) return String(firstSpese.projektId);
    return "";
  }, [
    unbilledData,
    preSelectedTimeIds,
    preSelectedExpenseIds,
    isEditMode,
    positions,
    editModeTimeEntries,
  ]);

  const firstProject = useMemo(
    () => allProjects.find((p) => String(p.id) === firstProjektId),
    [allProjects, firstProjektId],
  );

  const placeholderCtx: PlaceholderContext = useMemo(() => {
    // Derive extended placeholder values from positions
    const leistungPositions = positions.filter(
      (p) => p.typ === InvoicePositionTyp.leistung,
    );
    const firstLeistungsart = leistungPositions[0]?.leistungsart ?? "";
    // zeitraum_von / _bis from position dates
    const positionDates = leistungPositions
      .map((p) => p.datum)
      .filter(Boolean) as string[];
    const zeitraumVonISO =
      positionDates.length > 0 ? [...positionDates].sort()[0] : "";
    const zeitraumBisISO =
      positionDates.length > 0 ? [...positionDates].sort().reverse()[0] : "";
    // total hours from leistung positions
    const totalMins = leistungPositions.reduce(
      (s, p) => s + Math.round(p.menge * 60),
      0,
    );
    const totalStunden =
      totalMins > 0
        ? `${Math.floor(totalMins / 60)}:${String(totalMins % 60).padStart(2, "0")}`
        : "";

    // Derive mitarbeiter names from project member assignments (new mode) or time entries (edit mode)
    const employeeIds = new Set<string>();
    if (!isEditMode) {
      // New mode: look up employeeIds from projectMembersMap for positions with referenzId
      for (const pos of leistungPositions) {
        if (!pos.referenzId) continue;
        const ze = (unbilledData?.zeiteintraege ?? []).find(
          (z) => String(z.id) === String(pos.referenzId),
        );
        if (!ze) continue;
        const members = projectMembersMap.get(String(ze.projectId)) ?? [];
        const match = members.find(
          (m) => String(m.serviceTypeId) === String(ze.serviceTypeId),
        );
        if (match?.employeeId) employeeIds.add(String(match.employeeId));
      }
    } else {
      // Edit mode: look up employeeIds from editModeTimeEntries via referenzId
      for (const pos of leistungPositions) {
        if (!pos.referenzId) continue;
        const te = editModeTimeEntries.find(
          (e) => String(e.id) === String(pos.referenzId),
        );
        if (te && "employeeId" in te) {
          employeeIds.add(String((te as { employeeId: bigint }).employeeId));
        }
      }
    }
    const mitarbeiterNames = allEmployees
      .filter((e) => employeeIds.has(String(e.id)))
      .map((e) => `${e.firstName} ${e.lastName}`);
    const mitarbeiterKuerzels = allEmployees
      .filter((e) => employeeIds.has(String(e.id)))
      .map(
        (e) => e.kuerzel ?? `${e.firstName.charAt(0)}${e.lastName.charAt(0)}`,
      );
    const mitarbeiterName =
      mitarbeiterNames.length > 0 ? mitarbeiterNames.join(", ") : "";
    const mitarbeiterKuerzel =
      mitarbeiterKuerzels.length > 0 ? mitarbeiterKuerzels.join(", ") : "";

    return {
      projektName: firstProject?.name ?? "",
      projektKuerzel:
        firstProject?.kuerzel ?? firstProject?.kurzbezeichnung ?? "",
      bank: template?.bank ?? "",
      iban: template?.iban ?? "",
      mwstNummer: template?.mwstNummer ?? companyData?.taxId ?? "",
      kontoInhaber: template?.qrKontoinhaber ?? companyName ?? "",
      kontoAdresse:
        template?.qrKontoinhaberAdresse ?? companyData?.address ?? "",
      rechnungsnummer,
      datum: datum,
      faelligkeitsdatum: faelligkeitsdatum,
      kundenname: selectedCustomer?.name ?? "",
      mitarbeiterName,
      mitarbeiterKuerzel,
      leistungsart: firstLeistungsart,
      zeitraumVon: zeitraumVonISO ? isoToDisplay(zeitraumVonISO) : "",
      zeitraumBis: zeitraumBisISO ? isoToDisplay(zeitraumBisISO) : "",
      totalStunden,
    };
  }, [
    firstProject,
    template,
    rechnungsnummer,
    datum,
    faelligkeitsdatum,
    selectedCustomer,
    companyData,
    companyName,
    positions,
    allEmployees,
    isEditMode,
    unbilledData,
    projectMembersMap,
    editModeTimeEntries,
  ]);

  // ── QR Code generation ──────────────────────────────────────────────────────

  const qrData = useMemo(() => {
    if (!qrAktiv || !template?.qrIban) return null;
    return buildSwissQRData({
      iban: template.qrIban ?? "",
      kontoinhaber: template.qrKontoinhaber ?? companyName ?? "",
      kontoinhaberAdresse: template.qrKontoinhaberAdresse ?? "",
      kundeNamen: selectedCustomer?.name ?? "",
      kundeAdresse: selectedCustomer?.rechnungsadresse
        ? `${selectedCustomer.rechnungsadresse.strasse ?? ""}, ${selectedCustomer.rechnungsadresse.plz ?? ""} ${selectedCustomer.rechnungsadresse.ort ?? ""}`.trim()
        : "",
      betrag: totalRounded,
      waehrung: "CHF", // Swiss Payment Standards: QR-Zahlschein always CHF
      referenztyp: template.qrReferenztyp ?? "NON",
      referenz: template.qrReferenzPraefix
        ? `${template.qrReferenzPraefix}${rechnungsnummer}`
        : rechnungsnummer,
      zusatz: rechnungsnummer,
    });
  }, [
    qrAktiv,
    template,
    selectedCustomer,
    totalRounded,
    rechnungsnummer,
    companyName,
  ]);

  const qrDataUrl = useQRCode(qrData);

  // ── Customer address positioning (from template fields, fallback to localStorage) ────────────

  const kundenadresseAbstandOben: number = useMemo(() => {
    // Prefer value from template backend (set by RechnungsvorlagenTab and persisted to backend)
    if (template?.kundenadresseAbstandOben != null) {
      return Number(template.kundenadresseAbstandOben);
    }
    // Fallback: localStorage (set by older saves before backend persistence)
    try {
      const saved = localStorage.getItem("rv_kundenadresse_abstand_oben");
      if (saved) return Number(saved);
    } catch {
      /* ignore */
    }
    return 45;
  }, [template]);

  // Horizontal character-exact indentation for customer address
  const kundenadresseEinrueckungZeichen: number = useMemo(() => {
    // Prefer value from template backend
    if (template?.kundenadresseEinrueckungZeichen != null) {
      return Number(template.kundenadresseEinrueckungZeichen);
    }
    // Fallback: localStorage
    try {
      const saved = localStorage.getItem(
        "rv_kundenadresse_einrueckung_zeichen",
      );
      if (saved) return Number(saved);
    } catch {
      /* ignore */
    }
    return 0;
  }, [template]);

  const kundenadressePosition: string = useMemo(() => {
    // Dedicated horizontal position for customer address (localStorage key rv_kundenadresse_position)
    // Default: "links" (for standard Swiss window envelopes with left window)
    try {
      const saved = localStorage.getItem("rv_kundenadresse_position");
      if (saved === "links" || saved === "rechts" || saved === "zentriert")
        return saved;
    } catch {
      /* ignore */
    }
    // Fallback: don't use kopfzeileAdressePosition (that's for the firma address, not kunde)
    return "links";
  }, []);

  // Vertical spacing after customer address block (from template or localStorage)
  const kundenadresseAbstandNach: number = useMemo(() => {
    // kundenadresseAbstandNach is stored as bigint in the backend type
    if (template?.kundenadresseAbstandNach != null) {
      return Number(template.kundenadresseAbstandNach);
    }
    try {
      const saved = localStorage.getItem("rv_kundenadresse_abstand_nach");
      if (saved) return Number(saved);
    } catch {
      /* ignore */
    }
    return 10;
  }, [template]);

  // ── Mutations ───────────────────────────────────────────────────────────────

  const saveInvoice = useMutation({
    mutationFn: async (targetStatus: InvoiceStatus) => {
      if (!actor) throw new Error("Kein Actor verfügbar");
      const posInputs = positions.map(posToInput);
      const isoD = displayToISO(datum) || todayISO();
      const isoF = displayToISO(faelligkeitsdatum) || addDays(isoD, 30);

      if (isEditMode && invoiceId) {
        const res = (await toAny(actor).updateInvoice(BigInt(invoiceId), {
          status: targetStatus,
          fusstext,
          positionen: posInputs,
          faelligkeitsdatum: isoF,
          mwstSatz: mwstNum,
          rabatt: rabattNum,
          kopftext,
          kundeId: kundeId ? BigInt(kundeId) : undefined,
          datum: isoD,
          skonto: skontoNum,
        })) as { __kind__: string; err?: string };
        if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
        return res;
      }
      if (!kundeId) throw new Error("Kein Kunde gesetzt");
      const createRes = (await toAny(actor).createInvoice({
        kundeId: BigInt(kundeId),
        fusstext,
        positionen: posInputs,
        mwstSatz: mwstNum,
        rabatt: rabattNum,
        kopftext,
        skonto: skontoNum,
      })) as { __kind__: string; err?: string; ok?: Invoice };
      if (createRes.__kind__ === "err")
        throw new Error(createRes.err ?? "Fehler");
      return createRes;
    },
  });

  const markVersendet = useMutation({
    mutationFn: async (targetInvoiceIdOverride?: bigint) => {
      if (!actor) throw new Error("Kein Actor verfügbar");
      const targetInvoiceId =
        targetInvoiceIdOverride ??
        (isEditMode && invoiceId ? BigInt(invoiceId) : null);
      if (!targetInvoiceId) throw new Error("Keine Rechnungs-ID");
      const timeRefIds = positions
        .filter((p) => p.typ === InvoicePositionTyp.leistung && p.referenzId)
        .map((p) => p.referenzId!);
      const expRefIds = positions
        .filter((p) => p.typ === InvoicePositionTyp.spese && p.referenzId)
        .map((p) => p.referenzId!);
      const res = (await toAny(actor).markFakturiert(
        targetInvoiceId,
        timeRefIds,
        expRefIds,
      )) as {
        __kind__: string;
        err?: string;
      };
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveEntwurf = async () => {
    setErrorMsg(null);
    setIsSaving(true);
    try {
      await saveInvoice.mutateAsync(InvoiceStatus.entwurf);
      navigate({
        to: "/fakturierung",
        search: { tab: "rechnungen", filterStatus: "entwurf" },
      } as never);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVersendet = async () => {
    setErrorMsg(null);
    setIsMarkingVersendet(true);
    try {
      const saveRes = await saveInvoice.mutateAsync(InvoiceStatus.versendet);
      if (isEditMode && invoiceId) {
        await markVersendet.mutateAsync(undefined);
      } else {
        const newInvoice = (saveRes as { __kind__: string; ok?: Invoice }).ok;
        if (newInvoice?.id) {
          await markVersendet.mutateAsync(newInvoice.id);
        }
      }
      navigate({ to: "/fakturierung", search: { tab: "rechnungen" } } as never);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setIsMarkingVersendet(false);
    }
  };

  const handleBack = () => {
    navigate({
      to: "/fakturierung",
      search: { tab: "rechnungen", filterStatus: "entwurf" },
    } as never);
  };

  const handlePrint = () => window.print();

  const addPosition = () => {
    setPositions((prev) => [
      ...prev,
      {
        id: newLocalId(),
        typ: InvoicePositionTyp.freitext,
        bezeichnung: "",
        menge: 1,
        einheit: "Std.",
        preis: 0,
      },
    ]);
  };

  const removePosition = (id: string) =>
    setPositions((prev) => prev.filter((p) => p.id !== id));

  const updatePosition = <K extends keyof EditablePosition>(
    id: string,
    field: K,
    value: EditablePosition[K],
  ) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  // ── Loading ──────────────────────────────────────────────────────────────────

  const isLoading =
    customersLoading || templateLoading || (isEditMode && invoiceLoading);

  const hasQrIban = !!template?.qrIban;

  // ── Header logo ──────────────────────────────────────────────────────────────

  const headerLogoUrl =
    template?.kopfzeileLogoQuelle === "upload"
      ? (template.kopfzeileBildUrl ?? companyLogoUrl ?? "")
      : (companyLogoUrl ?? "");

  const logoHeightMap: Record<string, number> = {
    small: 30,
    medium: 60,
    large: 90,
  };
  const logoHeight =
    logoHeightMap[template?.kopfzeileLogoGroesse ?? "medium"] ?? 60;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <Layout>
      {/* Print styles */}
      <style>{`
        @media print {
          /* Hide everything except the invoice preview */
          .invoice-editor-section { display: none !important; }
          nav, header, aside, footer,
          [data-ocid="support-chat"], .stopwatch-widget,
          .no-print { display: none !important; }
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }

          /* ── Override ALL Layout overflow constraints ── */
          /* h-screen overflow-hidden wrapper */
          .h-screen {
            height: auto !important;
            overflow: visible !important;
          }
          /* flex overflow-hidden wrappers */
          .overflow-hidden {
            overflow: visible !important;
          }
          /* main overflow-y-auto */
          main {
            overflow: visible !important;
            height: auto !important;
            flex: none !important;
          }

          /* Reset Tailwind layout wrappers */
          .p-4, .md\\:p-6, .max-w-screen-2xl {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }

          /* Flex row becomes block so preview is full width */
          .flex.flex-col.lg\\:flex-row,
          .flex-col.lg\\:flex-row {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* Invoice preview section: full A4 width, NO overflow clipping */
          .invoice-preview-section,
          #invoice-print-root {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 210mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            overflow-y: visible !important;
            overflow-x: visible !important;
            box-shadow: none !important;
            border: none !important;
            flex: none !important;
            flex-shrink: 0 !important;
          }

          /* Inner invoice card: remove fixed sizing */
          .invoice-preview-section > div,
          #invoice-print-root > div {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            overflow-y: visible !important;
            box-shadow: none !important;
            border: none !important;
            padding: 8mm !important;
            border-radius: 0 !important;
          }

          /* Table multipage rules */
          table { page-break-inside: auto !important; width: 100% !important; }
          thead { display: table-header-group !important; }
          tfoot { display: table-footer-group !important; }
          tbody tr { page-break-inside: avoid !important; page-break-after: auto !important; }

          /* QR Zahlschein always on its own page — DO NOT REMOVE */
          .qr-zahlschein {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 0 !important;
            padding-top: 24px !important;
          }
        }
        @page { size: A4; margin: 15mm; }
      `}</style>

      <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
        {/* Page header */}
        <div className="invoice-editor-section flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            data-ocid="invoice-editor.back_button"
            onClick={handleBack}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold text-foreground leading-tight">
                {isEditMode ? "Rechnung bearbeiten" : "Neue Rechnung"}
              </h1>
              {rechnungsnummer && (
                <p className="text-xs text-muted-foreground">
                  {rechnungsnummer}
                </p>
              )}
            </div>
          </div>
          {isEditMode &&
            (status === InvoiceStatus.ueberfaellig ? (
              <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                {STATUS_LABELS[status]}
              </span>
            ) : (
              <Badge
                variant={
                  STATUS_COLORS[status] as
                    | "secondary"
                    | "default"
                    | "outline"
                    | "destructive"
                }
                className="ml-auto"
              >
                {STATUS_LABELS[status]}
              </Badge>
            ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── LEFT: Editor ─────────────────────────────────────────── */}
            <div
              className="invoice-editor-section flex-1 space-y-5"
              data-ocid="invoice-editor.panel"
            >
              {errorMsg && (
                <div
                  data-ocid="invoice-editor.error_state"
                  className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-sm text-destructive"
                >
                  {errorMsg}
                </div>
              )}

              {/* Header section */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Rechnungskopf
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kunde – always read-only */}
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-kunde">Kunde</Label>
                    <Input
                      id="inv-kunde"
                      data-ocid="invoice-editor.kunde_field"
                      value={
                        selectedCustomer?.name ??
                        (kundeId ? `Kunde #${kundeId}` : "–")
                      }
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>

                  {/* Rechnungsnummer – always read-only */}
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-nr">Rechnungsnummer</Label>
                    <Input
                      id="inv-nr"
                      data-ocid="invoice-editor.rechnungsnummer_input"
                      value={rechnungsnummer}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>

                  {/* Datum */}
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-datum">
                      Rechnungsdatum (TT.MM.JJJJ)
                    </Label>
                    <Input
                      id="inv-datum"
                      data-ocid="invoice-editor.datum_input"
                      type="text"
                      placeholder="TT.MM.JJJJ"
                      value={datum}
                      onChange={(e) => setDatum(e.target.value)}
                    />
                  </div>

                  {/* Fälligkeitsdatum */}
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-faelligkeit">
                      Fälligkeitsdatum (TT.MM.JJJJ)
                    </Label>
                    <Input
                      id="inv-faelligkeit"
                      data-ocid="invoice-editor.faelligkeitsdatum_input"
                      type="text"
                      placeholder="TT.MM.JJJJ"
                      value={faelligkeitsdatum}
                      onChange={(e) => setFaelligkeitsdatum(e.target.value)}
                    />
                  </div>

                  {/* Währung */}
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-waehrung">Währung</Label>
                    <Input
                      id="inv-waehrung"
                      value={waehrung}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>

                  {/* Status – only in edit mode */}
                  {isEditMode && (
                    <div className="space-y-1.5">
                      <Label htmlFor="inv-status">Status</Label>
                      <select
                        id="inv-status"
                        data-ocid="invoice-editor.status_select"
                        value={status}
                        onChange={(e) =>
                          setStatus(e.target.value as InvoiceStatus)
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {(
                          Object.entries(STATUS_LABELS) as [
                            InvoiceStatus,
                            string,
                          ][]
                        ).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* QR Toggle */}
                {hasQrIban && (
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <Switch
                      id="qr-toggle"
                      data-ocid="invoice-editor.qr_toggle"
                      checked={qrAktiv}
                      onCheckedChange={setQrAktiv}
                    />
                    <Label htmlFor="qr-toggle" className="cursor-pointer">
                      Rechnung mit QR-Code (Zahlschein) drucken
                    </Label>
                  </div>
                )}
              </div>

              {/* Positionen */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Positionen
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid="invoice-editor.add_position_button"
                    onClick={addPosition}
                    className="gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Position hinzufügen
                  </Button>
                </div>

                {positions.length === 0 ? (
                  <div
                    data-ocid="invoice-editor.positions.empty_state"
                    className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground"
                  >
                    <FileText className="w-8 h-8 opacity-30" />
                    <p className="text-sm">
                      Noch keine Positionen. Klicke auf «Position hinzufügen».
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left pb-2 px-1 font-medium text-muted-foreground w-[40%]">
                            Bezeichnung
                          </th>
                          <th className="text-right pb-2 px-1 font-medium text-muted-foreground w-[10%]">
                            Menge
                          </th>
                          <th className="text-left pb-2 px-1 font-medium text-muted-foreground w-[10%]">
                            Einheit
                          </th>
                          <th className="text-right pb-2 px-1 font-medium text-muted-foreground w-[15%]">
                            Preis
                          </th>
                          <th className="text-right pb-2 px-1 font-medium text-muted-foreground w-[15%]">
                            Total
                          </th>
                          <th className="pb-2 px-1 w-[5%]" />
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((p, idx) => {
                          const lineTotal = p.menge * p.preis;
                          return (
                            <tr
                              key={p.id}
                              data-ocid={`invoice-editor.position.item.${idx + 1}`}
                              className="border-b border-border/50 last:border-0"
                            >
                              <td className="py-1.5 px-1">
                                <Input
                                  data-ocid={`invoice-editor.position.bezeichnung.${idx + 1}`}
                                  value={p.bezeichnung}
                                  onChange={(e) =>
                                    updatePosition(
                                      p.id,
                                      "bezeichnung",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Bezeichnung"
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="py-1.5 px-1">
                                <Input
                                  data-ocid={`invoice-editor.position.menge.${idx + 1}`}
                                  type="number"
                                  value={p.menge}
                                  onChange={(e) =>
                                    updatePosition(
                                      p.id,
                                      "menge",
                                      Number.parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="h-8 text-sm text-right"
                                  min={0}
                                  step={0.25}
                                />
                              </td>
                              <td className="py-1.5 px-1">
                                <Input
                                  data-ocid={`invoice-editor.position.einheit.${idx + 1}`}
                                  value={p.einheit}
                                  onChange={(e) =>
                                    updatePosition(
                                      p.id,
                                      "einheit",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Std."
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="py-1.5 px-1">
                                <Input
                                  data-ocid={`invoice-editor.position.preis.${idx + 1}`}
                                  type="number"
                                  value={p.preis}
                                  onChange={(e) =>
                                    updatePosition(
                                      p.id,
                                      "preis",
                                      Number.parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="h-8 text-sm text-right"
                                  min={0}
                                  step={0.01}
                                />
                              </td>
                              <td className="py-1.5 px-1 text-right tabular-nums font-medium">
                                {waehrung}&nbsp;
                                {lineTotal.toLocaleString("de-CH", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="py-1.5 px-1 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  data-ocid={`invoice-editor.position.delete_button.${idx + 1}`}
                                  onClick={() => removePosition(p.id)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Beträge */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Beträge
                </h2>
                <div className="max-w-xs ml-auto space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zwischensumme</span>
                    <span className="tabular-nums">
                      {formatAmount(zwischensumme, waehrung)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label
                      htmlFor="inv-rabatt"
                      className="text-sm text-muted-foreground whitespace-nowrap"
                    >
                      Rabatt ({waehrung})
                    </Label>
                    <Input
                      id="inv-rabatt"
                      data-ocid="invoice-editor.rabatt_input"
                      type="number"
                      value={rabatt}
                      onChange={(e) => setRabatt(e.target.value)}
                      className="h-8 text-sm text-right w-28"
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label
                      htmlFor="inv-skonto"
                      className="text-sm text-muted-foreground whitespace-nowrap"
                    >
                      Skonto ({waehrung})
                    </Label>
                    <Input
                      id="inv-skonto"
                      data-ocid="invoice-editor.skonto_input"
                      type="number"
                      value={skonto}
                      onChange={(e) => setSkonto(e.target.value)}
                      className="h-8 text-sm text-right w-28"
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Label
                      htmlFor="inv-mwst"
                      className="text-sm text-muted-foreground whitespace-nowrap"
                    >
                      MwSt-Satz (%)
                    </Label>
                    <Input
                      id="inv-mwst"
                      data-ocid="invoice-editor.mwst_input"
                      type="number"
                      value={mwstSatz}
                      onChange={(e) => setMwstSatz(e.target.value)}
                      className="h-8 text-sm text-right w-28"
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MwSt-Betrag</span>
                    <span className="tabular-nums">
                      {formatAmount(mwstBetrag, waehrung)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-lg text-primary tabular-nums">
                      {formatAmount(total, waehrung)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Texte */}
              <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Texte
                </h2>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-kopftext">Kopftext</Label>
                    <Textarea
                      id="inv-kopftext"
                      data-ocid="invoice-editor.kopftext_textarea"
                      value={kopftext}
                      onChange={(e) => setKopftext(e.target.value)}
                      rows={3}
                      placeholder="Kopftext der Rechnung…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inv-fusstext">Fusstext</Label>
                    <Textarea
                      id="inv-fusstext"
                      data-ocid="invoice-editor.fusstext_textarea"
                      value={fusstext}
                      onChange={(e) => setFusstext(e.target.value)}
                      rows={4}
                      placeholder="Zahlungsinformationen, Bankverbindung…"
                    />
                  </div>
                </div>
              </div>

              {/* Bankverbindung aus Vorlage (read-only info) */}
              {(template?.iban || template?.bank || template?.mwstNummer) && (
                <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Bankverbindung (aus Vorlage)
                  </p>
                  {template.bank && (
                    <p className="text-sm text-foreground">{template.bank}</p>
                  )}
                  {template.iban && (
                    <p className="text-sm text-foreground font-mono">
                      IBAN: {template.iban}
                    </p>
                  )}
                  {template.mwstNummer && (
                    <p className="text-sm text-muted-foreground">
                      MwSt-Nr: {template.mwstNummer}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    data-ocid="invoice-editor.save_entwurf_button"
                    onClick={handleSaveEntwurf}
                    disabled={isSaving || isMarkingVersendet}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Entwurf speichern
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    data-ocid="invoice-editor.versendet_button"
                    onClick={handleVersendet}
                    disabled={isSaving || isMarkingVersendet}
                    className="gap-2"
                  >
                    {isMarkingVersendet ? (
                      <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Als versendet markieren
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    data-ocid="invoice-editor.print_button"
                    onClick={handlePrint}
                    className="gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    PDF drucken
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    data-ocid="invoice-editor.cancel_button"
                    onClick={handleBack}
                    className="ml-auto"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Live Preview ──────────────────────────────── */}
            <div
              id="invoice-print-root"
              className="invoice-preview-section lg:w-[580px] xl:w-[640px] shrink-0"
            >
              {/* Invoice card — normal flow: company header first, then customer address below */}
              <div
                className="bg-white shadow-lg rounded-lg border border-border/50 text-sm text-[#222] font-body"
                style={{ padding: "2rem" }}
              >
                {/* Template kopfzeile image (separate header image) */}
                {template?.kopfzeileLogoQuelle !== "upload" &&
                  template?.kopfzeileBildUrl && (
                    <div
                      className={`mb-3 ${imgAlignClass(template.kopfzeileBildPosition)}`}
                    >
                      <img
                        src={template.kopfzeileBildUrl}
                        alt="Kopfzeile"
                        className="max-h-16 max-w-full object-contain"
                      />
                    </div>
                  )}

                {/* Company header — logo + firma address only.
                    Customer address is rendered in normal flow above (paddingTop + marginBottom). */}
                {(() => {
                  if (template?.kopfzeileLayout === "uebereinander") {
                    return (
                      <div className="mb-8">
                        <div className="space-y-2">
                          {/* Logo */}
                          <div
                            className={`flex ${imgAlignClass(template?.kopfzeileAdressePosition) ? `justify-${template?.kopfzeileAdressePosition}` : "justify-start"}`}
                          >
                            {headerLogoUrl && (
                              <img
                                src={headerLogoUrl}
                                alt="Firmenlogo"
                                style={{ height: `${logoHeight}px` }}
                                className="object-contain"
                              />
                            )}
                          </div>
                          {/* Firm address */}
                          <div
                            className={alignClass(
                              template?.kopfzeileAdressePosition,
                            )}
                          >
                            {template?.kopfzeileAdresse ? (
                              <div className="text-xs text-[#555] whitespace-pre-line">
                                {template.kopfzeileAdresse}
                              </div>
                            ) : (
                              <>
                                <div className="font-semibold text-base">
                                  {companyName ?? "Firmenname"}
                                </div>
                                {companyData?.address && (
                                  <div className="text-xs text-[#555] whitespace-pre-line">
                                    {companyData.address}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Default: nebeneinander (firma left, kunde rendered above in normal flow)
                  return (
                    <div className="mb-8">
                      <div className="space-y-1 max-w-[55%]">
                        {headerLogoUrl && (
                          <img
                            src={headerLogoUrl}
                            alt="Firmenlogo"
                            style={{
                              height: `${Math.round(logoHeight * 0.75)}px`,
                            }}
                            className="object-contain mb-2"
                          />
                        )}
                        {template?.kopfzeileAdresse ? (
                          <div className="text-xs text-[#555] whitespace-pre-line">
                            {template.kopfzeileAdresse}
                          </div>
                        ) : (
                          <>
                            <div className="font-semibold text-base">
                              {companyName ?? "Firmenname"}
                            </div>
                            {companyData?.address && (
                              <div className="text-xs text-[#555] whitespace-pre-line">
                                {companyData.address}
                              </div>
                            )}
                          </>
                        )}
                        {template?.mwstNummer && (
                          <div className="text-xs text-[#666]">
                            MwSt-Nr: {template.mwstNummer}
                          </div>
                        )}
                        {template?.iban && (
                          <div className="text-xs text-[#666]">
                            {template.bank && <>{template.bank} · </>}IBAN:{" "}
                            {template.iban}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Customer address — rendered AFTER company header, with configurable spacing */}
                {selectedCustomer && (
                  <div
                    style={{
                      marginTop: `${kundenadresseAbstandOben}px`,
                      marginBottom: `${kundenadresseAbstandNach}px`,
                      ...(kundenadressePosition === "rechts"
                        ? { textAlign: "right" as const }
                        : kundenadressePosition === "zentriert"
                          ? { textAlign: "center" as const }
                          : {
                              paddingLeft: `${kundenadresseEinrueckungZeichen}px`,
                              textAlign: "left" as const,
                            }),
                    }}
                    className="text-xs space-y-0.5"
                  >
                    <div className="font-semibold text-sm">
                      {selectedCustomer.name}
                    </div>
                    {selectedCustomer.rechnungsadresse?.zusatz1 && (
                      <div>{selectedCustomer.rechnungsadresse.zusatz1}</div>
                    )}
                    {selectedCustomer.rechnungsadresse?.zusatz2 && (
                      <div>{selectedCustomer.rechnungsadresse.zusatz2}</div>
                    )}
                    {selectedCustomer.rechnungsadresse?.strasse && (
                      <div>{selectedCustomer.rechnungsadresse.strasse}</div>
                    )}
                    {selectedCustomer.rechnungsadresse?.postfach && (
                      <div>{selectedCustomer.rechnungsadresse.postfach}</div>
                    )}
                    {(selectedCustomer.rechnungsadresse?.plz ||
                      selectedCustomer.rechnungsadresse?.ort) && (
                      <div>
                        {selectedCustomer.rechnungsadresse.plz}{" "}
                        {selectedCustomer.rechnungsadresse.ort}
                      </div>
                    )}
                    {selectedCustomer.rechnungsadresse?.land &&
                      selectedCustomer.rechnungsadresse.land !== "Schweiz" &&
                      selectedCustomer.rechnungsadresse.land !== "CH" && (
                        <div>{selectedCustomer.rechnungsadresse.land}</div>
                      )}
                  </div>
                )}

                {/* Invoice meta */}
                <div className="mb-6 space-y-1 border-b border-[#e0e0e0] pb-4">
                  <div className="flex gap-8">
                    <div>
                      <span className="text-xs text-[#888] block">
                        Rechnungsnummer
                      </span>
                      <span className="font-semibold">
                        {rechnungsnummer || "RE-0001"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#888] block">Datum</span>
                      <span>{datum || isoToDisplay(todayISO())}</span>
                    </div>
                    {faelligkeitsdatum && (
                      <div>
                        <span className="text-xs text-[#888] block">
                          Fällig am
                        </span>
                        <span>{faelligkeitsdatum}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kopftext with positioning and placeholder replacement */}
                {kopftext && (
                  <div
                    className={`mb-5 text-xs whitespace-pre-line leading-relaxed ${alignClass(template?.kopfzeilePosition)}`}
                  >
                    {replacePlaceholders(kopftext, placeholderCtx)}
                  </div>
                )}

                {/* Positions */}
                {(() => {
                  const leistungen = positions.filter(
                    (p) => p.typ !== InvoicePositionTyp.spese,
                  );
                  const spesen = positions.filter(
                    (p) => p.typ === InvoicePositionTyp.spese,
                  );
                  const leistungenTotal = leistungen.reduce(
                    (s, p) => s + p.menge * p.preis,
                    0,
                  );
                  const spesenTotal = spesen.reduce(
                    (s, p) => s + p.menge * p.preis,
                    0,
                  );

                  const accentColor = template?.farbe || "#006066";

                  // ── Leistungen table (with Datum, Bezeichnung=Leistungsart+Desc, Menge hh:mm, Einheit, Preis, Total)
                  const renderLeistungenSection = (
                    rows: EditablePosition[],
                    sectionTotal: number,
                  ) => (
                    <div className="mb-5" key="leistungen">
                      <div
                        className="font-semibold text-xs mb-1 uppercase tracking-wide"
                        style={{ color: accentColor }}
                      >
                        Leistungen
                      </div>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr
                            className="border-b-2"
                            style={{ borderBottomColor: accentColor }}
                          >
                            <th className="text-left py-1 pr-2 font-semibold w-20">
                              Datum
                            </th>
                            <th className="text-left py-1 pr-2 font-semibold">
                              Bezeichnung
                            </th>
                            <th className="text-right py-1 pr-2 font-semibold w-14">
                              Menge
                            </th>
                            <th className="text-left py-1 pr-2 font-semibold w-12">
                              Einheit
                            </th>
                            <th className="text-right py-1 pr-2 font-semibold w-20">
                              Preis {waehrung}
                            </th>
                            <th className="text-right py-1 font-semibold w-20">
                              Total {waehrung}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((p) => {
                            const bezeichnungDisplay = p.leistungsart
                              ? p.bezeichnung
                                ? `${p.leistungsart} - ${p.bezeichnung}`
                                : p.leistungsart
                              : p.bezeichnung || "";
                            const datumDisplay = p.datum
                              ? isoToDisplay(p.datum)
                              : "";
                            // Zeit-Block: show Von–Bis before Menge if available
                            const vonBis =
                              p.von && p.bis ? `${p.von} – ${p.bis}` : null;
                            return (
                              <tr
                                key={p.id}
                                className="border-b border-[#f0f0f0]"
                              >
                                <td className="py-1 pr-2 text-[#888] tabular-nums whitespace-nowrap">
                                  {datumDisplay}
                                </td>
                                <td className="py-1 pr-2">
                                  {bezeichnungDisplay || (
                                    <span className="text-[#bbb] italic">
                                      —
                                    </span>
                                  )}
                                  {vonBis && (
                                    <div className="text-[#666] text-[10px] mt-0.5">
                                      {vonBis}
                                    </div>
                                  )}
                                </td>
                                <td className="py-1 pr-2 text-right tabular-nums">
                                  {formatHoursHHMM(p.menge)}
                                </td>
                                <td className="py-1 pr-2">{p.einheit}</td>
                                <td className="py-1 pr-2 text-right tabular-nums">
                                  {p.preis.toLocaleString("de-CH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </td>
                                <td className="py-1 text-right tabular-nums">
                                  {(p.menge * p.preis).toLocaleString("de-CH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                          {rows.length === 0 && (
                            <tr>
                              <td
                                colSpan={6}
                                className="py-3 text-center text-[#ccc] italic"
                              >
                                Keine Positionen
                              </td>
                            </tr>
                          )}
                          <tr
                            className="font-semibold"
                            style={{ borderTop: `1px solid ${accentColor}4D` }}
                          >
                            <td
                              colSpan={5}
                              className="py-1 pr-2 text-right text-[#555] text-xs"
                            >
                              Total Leistungen
                            </td>
                            <td
                              className="py-1 text-right tabular-nums"
                              style={{ color: accentColor }}
                            >
                              {sectionTotal.toLocaleString("de-CH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );

                  // ── Spesen table (Datum, Bezeichnung, Betrag CHF — no Menge/Einheit)
                  const renderSpesenSection = (
                    rows: EditablePosition[],
                    sectionTotal: number,
                  ) => (
                    <div className="mb-5" key="spesen">
                      <div
                        className="font-semibold text-xs mb-1 uppercase tracking-wide"
                        style={{ color: accentColor }}
                      >
                        Spesen
                      </div>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr
                            className="border-b-2"
                            style={{ borderBottomColor: accentColor }}
                          >
                            <th className="text-left py-1 pr-2 font-semibold w-20">
                              Datum
                            </th>
                            <th className="text-left py-1 pr-2 font-semibold">
                              Bezeichnung
                            </th>
                            <th className="text-right py-1 font-semibold w-24">
                              Betrag {waehrung}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((p) => {
                            const datumDisplay = p.datum
                              ? isoToDisplay(p.datum)
                              : "";
                            return (
                              <tr
                                key={p.id}
                                className="border-b border-[#f0f0f0]"
                              >
                                <td className="py-1 pr-2 text-[#888] tabular-nums whitespace-nowrap">
                                  {datumDisplay}
                                </td>
                                <td className="py-1 pr-2">
                                  {p.bezeichnung || (
                                    <span className="text-[#bbb] italic">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="py-1 text-right tabular-nums">
                                  {p.preis.toLocaleString("de-CH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                          {rows.length === 0 && (
                            <tr>
                              <td
                                colSpan={3}
                                className="py-3 text-center text-[#ccc] italic"
                              >
                                Keine Positionen
                              </td>
                            </tr>
                          )}
                          <tr
                            className="font-semibold"
                            style={{ borderTop: `1px solid ${accentColor}4D` }}
                          >
                            <td
                              colSpan={2}
                              className="py-1 pr-2 text-right text-[#555] text-xs"
                            >
                              Total Spesen
                            </td>
                            <td
                              className="py-1 text-right tabular-nums"
                              style={{ color: accentColor }}
                            >
                              {sectionTotal.toLocaleString("de-CH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );

                  if (leistungen.length === 0 && spesen.length === 0) {
                    return (
                      <div className="mb-5 py-4 text-center text-xs text-[#ccc] italic border border-[#f0f0f0] rounded">
                        Keine Positionen
                      </div>
                    );
                  }

                  return (
                    <>
                      {leistungen.length > 0 &&
                        renderLeistungenSection(leistungen, leistungenTotal)}
                      {spesen.length > 0 &&
                        renderSpesenSection(spesen, spesenTotal)}
                    </>
                  );
                })()}

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-56 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#666]">Zwischensumme</span>
                      <span className="tabular-nums">
                        {zwischensumme.toLocaleString("de-CH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {rabattNum !== 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#666]">Rabatt</span>
                        <span className="tabular-nums text-red-600">
                          -
                          {rabattNum.toLocaleString("de-CH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    {skontoNum !== 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#666]">Skonto</span>
                        <span className="tabular-nums text-red-600">
                          -
                          {skontoNum.toLocaleString("de-CH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-[#666]">MwSt {mwstNum}%</span>
                      <span className="tabular-nums">
                        {mwstBetrag.toLocaleString("de-CH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div
                      className="flex justify-between border-t-2 pt-1.5 font-bold"
                      style={{ borderTopColor: template?.farbe || "#006066" }}
                    >
                      <span>Total {waehrung}</span>
                      <span
                        className="tabular-nums"
                        style={{ color: template?.farbe || "#006066" }}
                      >
                        {totalRounded.toLocaleString("de-CH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fusstext with positioning and placeholder replacement */}
                {fusstext && (
                  <div
                    className={`text-xs whitespace-pre-line leading-relaxed text-[#555] border-t border-[#e0e0e0] pt-4 ${alignClass(template?.fusszeilePosition)}`}
                  >
                    {replacePlaceholders(fusstext, placeholderCtx)}
                  </div>
                )}

                {/* Template fusszeile image */}
                {template?.fusszeileBildUrl && (
                  <div
                    className={`mt-3 ${imgAlignClass(template.fusszeileBildPosition)}`}
                  >
                    <img
                      src={template.fusszeileBildUrl}
                      alt="Fusszeile"
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                )}

                {/* QR Zahlschein — always on separate page when printed */}
                {qrAktiv && template?.qrIban && (
                  <div className="qr-zahlschein mt-12 pt-6 border-t-2 border-dashed border-[#aaa]">
                    <div className="text-center text-[10px] text-[#888] mb-4 tracking-widest">
                      ✂ Hier abtrennen
                    </div>
                    <div className="flex gap-0 text-[10px]">
                      {/* Empfangsschein (left 1/3) */}
                      <div className="w-1/3 border-r border-[#ccc] pr-3 space-y-2">
                        <div className="font-bold text-xs">Empfangsschein</div>
                        <div>
                          <div className="text-[#888] text-[9px]">
                            Konto / Zahlbar an
                          </div>
                          <div className="font-mono text-[9px] break-all">
                            {template.qrIban}
                          </div>
                          <div className="text-[9px]">
                            {template.qrKontoinhaber}
                          </div>
                          {template.qrKontoinhaberAdresse && (
                            <div className="text-[9px]">
                              {template.qrKontoinhaberAdresse}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-[#888] text-[9px]">
                            Zahlbar durch
                          </div>
                          <div className="text-[9px]">
                            {selectedCustomer?.name}
                          </div>
                          <div className="text-[9px]">
                            {selectedCustomer?.rechnungsadresse?.strasse}
                          </div>
                          <div className="text-[9px]">
                            {selectedCustomer?.rechnungsadresse?.plz}{" "}
                            {selectedCustomer?.rechnungsadresse?.ort}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#888] text-[9px]">
                            Währung / Betrag
                          </div>
                          <div className="font-semibold text-[9px]">
                            CHF&nbsp;
                            {totalRounded.toLocaleString("de-CH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                        <div className="text-[#888] text-[9px] mt-1">
                          Annahmestelle
                        </div>
                      </div>

                      {/* Zahlteil (right 2/3) */}
                      <div className="w-2/3 pl-4 space-y-2">
                        <div className="font-bold text-xs">Zahlteil</div>
                        <div className="flex gap-3 items-start">
                          {/* Large QR */}
                          {qrDataUrl ? (
                            <img
                              src={qrDataUrl}
                              alt="QR Code"
                              className="w-28 h-28 shrink-0"
                            />
                          ) : (
                            <div className="w-28 h-28 border-2 border-dashed border-[#ccc] flex items-center justify-center text-[#ccc] text-[9px] shrink-0">
                              QR Code
                            </div>
                          )}
                          <div className="space-y-1.5 flex-1">
                            <div>
                              <div className="text-[#888] text-[9px]">
                                Währung
                              </div>
                              <div className="font-semibold text-[9px]">
                                CHF
                              </div>
                            </div>
                            <div>
                              <div className="text-[#888] text-[9px]">
                                Betrag
                              </div>
                              <div className="font-semibold text-[9px]">
                                {totalRounded.toLocaleString("de-CH", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-[#888] text-[9px]">
                            Zahlbar an
                          </div>
                          <div className="font-mono text-[9px] break-all">
                            {template.qrIban}
                          </div>
                          <div className="text-[9px]">
                            {template.qrKontoinhaber}
                          </div>
                          {template.qrKontoinhaberAdresse && (
                            <div className="text-[9px]">
                              {template.qrKontoinhaberAdresse}
                            </div>
                          )}
                        </div>
                        {template.qrReferenztyp &&
                          template.qrReferenztyp !== "NON" && (
                            <div>
                              <div className="text-[#888] text-[9px]">
                                Referenz
                              </div>
                              <div className="font-mono text-[9px]">
                                {template.qrReferenzPraefix}
                                {rechnungsnummer}
                              </div>
                            </div>
                          )}
                        <div>
                          <div className="text-[#888] text-[9px]">
                            Zahlbar durch
                          </div>
                          <div className="text-[9px]">
                            {selectedCustomer?.name}
                          </div>
                          <div className="text-[9px]">
                            {selectedCustomer?.rechnungsadresse?.strasse}
                          </div>
                          <div className="text-[9px]">
                            {selectedCustomer?.rechnungsadresse?.plz}{" "}
                            {selectedCustomer?.rechnungsadresse?.ort}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#888] text-[9px]">
                            Zusätzliche Informationen
                          </div>
                          <div className="text-[9px]">{rechnungsnummer}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
