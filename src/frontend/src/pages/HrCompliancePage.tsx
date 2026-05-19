import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { ShieldCheck } from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";
import { createActor } from "../backend";
import type { Employee } from "../backend";

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

const ComplianceCockpit = lazy(() => import("./compliance/ComplianceCockpit"));
const ComplianceMitarbeiterDetail = lazy(
  () => import("./compliance/ComplianceMitarbeiterDetail"),
);
const ComplianceFerienCompliance = lazy(
  () => import("./compliance/ComplianceFerienCompliance"),
);
const ComplianceRegeln = lazy(() => import("./compliance/ComplianceRegeln"));

function TabFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
      <ShieldCheck className="w-12 h-12 opacity-30" />
      <p className="text-sm">Wird geladen…</p>
    </div>
  );
}

export default function HrCompliancePage() {
  const { companyId, isAuthenticated } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const [employees, setEmployees] = useState<
    Array<
      Pick<Employee, "id" | "firstName" | "lastName"> & { startDate?: string }
    >
  >([]);

  useEffect(() => {
    if (!actor || isFetching || !isAuthenticated || !companyId) return;
    void (async () => {
      try {
        const result = (await toAny(actor).listEmployees(
          BigInt(companyId),
        )) as Employee[];
        setEmployees(
          result.map((e) => ({
            id: e.id,
            firstName: e.firstName,
            lastName: e.lastName,
            startDate: e.startDate,
          })),
        );
      } catch {
        // non-blocking
      }
    })();
  }, [actor, isFetching, isAuthenticated, companyId]);

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-semibold text-foreground">
                  HR &amp; Compliance
                </h1>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-2 py-0.5 font-medium"
                >
                  Schweiz
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Schweizer Compliance-Modul – Arbeitszeiten &amp; Abwesenheiten
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto bg-background">
          <Tabs defaultValue="cockpit" className="h-full flex flex-col">
            <div className="border-b border-border bg-card px-6 flex-shrink-0">
              <TabsList className="h-10 bg-transparent gap-0 p-0 rounded-none">
                <TabsTrigger
                  value="cockpit"
                  data-ocid="hr-compliance.cockpit_tab"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent h-10 px-4 text-sm font-medium"
                >
                  Cockpit
                </TabsTrigger>
                <TabsTrigger
                  value="mitarbeiter"
                  data-ocid="hr-compliance.mitarbeiter_tab"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent h-10 px-4 text-sm font-medium"
                >
                  Mitarbeiter-Detail
                </TabsTrigger>
                <TabsTrigger
                  value="ferien"
                  data-ocid="hr-compliance.ferien_tab"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent h-10 px-4 text-sm font-medium"
                >
                  Ferien-Compliance
                </TabsTrigger>
                <TabsTrigger
                  value="regeln"
                  data-ocid="hr-compliance.regeln_tab"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent h-10 px-4 text-sm font-medium"
                >
                  Regeln
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="cockpit" className="flex-1 mt-0 p-0">
              <Suspense fallback={<TabFallback />}>
                <ComplianceCockpit />
              </Suspense>
            </TabsContent>

            <TabsContent value="mitarbeiter" className="flex-1 mt-0 p-0">
              <Suspense fallback={<TabFallback />}>
                <ComplianceMitarbeiterDetail employees={employees} />
              </Suspense>
            </TabsContent>

            <TabsContent value="ferien" className="flex-1 mt-0 p-0">
              <Suspense fallback={<TabFallback />}>
                <ComplianceFerienCompliance employees={employees} />
              </Suspense>
            </TabsContent>

            <TabsContent value="regeln" className="flex-1 mt-0 p-0">
              <Suspense fallback={<TabFallback />}>
                <ComplianceRegeln />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
