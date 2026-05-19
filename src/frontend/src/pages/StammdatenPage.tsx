import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuthStore";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { AbsenceTypenTab } from "./stammdaten/AbsenceTypenTab";
import { FeiertageTab } from "./stammdaten/FeiertageTab";
import { FirmaTab } from "./stammdaten/FirmaTab";
import { KundenTab } from "./stammdaten/KundenTab";
import { LeistungsArtenTab } from "./stammdaten/LeistungsArtenTab";
import { MitarbeiterTab } from "./stammdaten/MitarbeiterTab";
import { ProjekteTab } from "./stammdaten/ProjekteTab";
import { RechnungsvorlagenTab } from "./stammdaten/RechnungsvorlagenTab";
import { SpesenArtenTab } from "./stammdaten/SpesenArtenTab";

type StammdatenTab =
  | "firma"
  | "mitarbeiter"
  | "kunden"
  | "projekte"
  | "leistungsarten"
  | "spesenarten"
  | "abwesenheitsarten"
  | "feiertage"
  | "rechnungsvorlagen";

const TAB_LABELS: Record<StammdatenTab, string> = {
  firma: "Firma",
  mitarbeiter: "Mitarbeiter",
  kunden: "Kunden",
  projekte: "Projekte",
  leistungsarten: "Leistungsarten",
  spesenarten: "Spesenarten",
  abwesenheitsarten: "Abwesenheitsarten",
  feiertage: "Feiertage",
  rechnungsvorlagen: "Rechnungsvorlagen",
};

const VALID_TABS: StammdatenTab[] = [
  "firma",
  "mitarbeiter",
  "kunden",
  "projekte",
  "leistungsarten",
  "spesenarten",
  "abwesenheitsarten",
  "feiertage",
  "rechnungsvorlagen",
];

export default function StammdatenPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId } = useAuth();
  const { tab } = useSearch({ from: "/stammdaten" });

  useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);

  const activeTab: StammdatenTab = VALID_TABS.includes(tab as StammdatenTab)
    ? (tab as StammdatenTab)
    : "mitarbeiter";
  const activeLabel = TAB_LABELS[activeTab];

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Stammdaten — {activeLabel}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Verwaltung der Stammdaten für Ihr Unternehmen
          </p>
        </div>

        <div key={activeTab} data-ocid="stammdaten-content">
          {activeTab === "firma" && <FirmaTab />}
          {activeTab === "mitarbeiter" && <MitarbeiterTab />}
          {activeTab === "kunden" && <KundenTab />}
          {activeTab === "projekte" && <ProjekteTab />}
          {activeTab === "leistungsarten" && <LeistungsArtenTab />}
          {activeTab === "spesenarten" && <SpesenArtenTab />}
          {activeTab === "abwesenheitsarten" && <AbsenceTypenTab />}
          {activeTab === "feiertage" && <FeiertageTab />}
          {activeTab === "rechnungsvorlagen" && <RechnungsvorlagenTab />}
        </div>
      </div>
    </Layout>
  );
}
