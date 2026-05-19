import { Skeleton } from "@/components/ui/skeleton";
import { StopwatchProvider } from "@/context/StopwatchContext";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

// Lazy-load pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NutzungsbedingungenPage = lazy(
  () => import("./pages/NutzungsbedingungenPage"),
);
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const InvitePage = lazy(() => import("./pages/InvitePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const KalenderPage = lazy(() => import("./pages/KalenderPage"));
const ZeitenPage = lazy(() => import("./pages/ZeitenPage"));
const SpesenPage = lazy(() => import("./pages/SpesenPage"));
const AuswertungenPage = lazy(() => import("./pages/AuswertungenPage"));
const FakturierungPage = lazy(() => import("./pages/FakturierungPage"));
const InvoiceEditorPage = lazy(() => import("./pages/InvoiceEditorPage"));
const StammdatenPage = lazy(() => import("./pages/StammdatenPage"));
const EinstellungenPage = lazy(() => import("./pages/EinstellungenPage"));
const GenehmigungsPage = lazy(() => import("./pages/GenehmigungsPage"));
const AbwesenheitPage = lazy(() => import("./pages/AbwesenheitPage"));
const LogoutPage = lazy(() => import("./pages/LogoutPage"));
const PlatformAdminPage = lazy(() => import("./pages/PlatformAdminPage"));
const CostDashboardPage = lazy(() => import("./pages/CostDashboardPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const HrCompliancePage = lazy(() => import("./pages/HrCompliancePage"));
const NotificationAdminPage = lazy(
  () => import("./pages/platformadmin/NotificationAdminPage"),
);
const StripeSuccessPage = lazy(
  () => import("./pages/stripe/StripeSuccessPage"),
);
const StripeCancelPage = lazy(() => import("./pages/stripe/StripeCancelPage"));

// Page loader fallback
function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="grid grid-cols-3 gap-4 mt-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <StopwatchProvider>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </StopwatchProvider>
  ),
});

// Public routes
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const nutzungsbedingungenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nutzungsbedingungen",
  component: NutzungsbedingungenPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const inviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/einladung",
  component: InvitePage,
});

// Protected routes
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const kalenderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kalender",
  component: KalenderPage,
});

const zeitenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/zeiten",
  component: ZeitenPage,
});

const spesenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/spesen",
  component: SpesenPage,
});

const auswertungenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auswertungen",
  component: AuswertungenPage,
});

const fakturierungRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fakturierung",
  component: FakturierungPage,
});

const invoiceNeuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fakturierung/rechnung/neu",
  validateSearch: (search: Record<string, unknown>) => ({
    zeitIds: (search.zeitIds as string) ?? "",
    speseIds: (search.speseIds as string) ?? "",
    kundeId: (search.kundeId as string) ?? "",
  }),
  component: InvoiceEditorPage,
});

const invoiceEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fakturierung/rechnung/$id",
  component: InvoiceEditorPage,
});

const stammdatenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stammdaten",
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) ?? "mitarbeiter",
  }),
  component: StammdatenPage,
});

const einstellungenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/einstellungen",
  component: EinstellungenPage,
});

const genehmigungsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/genehmigungen",
  component: GenehmigungsPage,
});
const hrComplianceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr-compliance",
  component: HrCompliancePage,
});

const abwesenheitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/abwesenheiten",
  component: AbwesenheitPage,
});

const logoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/logout",
  component: LogoutPage,
});

const platformAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform-admin",
  component: PlatformAdminPage,
});

const costDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kosten-dashboard",
  component: CostDashboardPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/benachrichtigungen",
  component: NotificationsPage,
});

const notificationAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform-admin/benachrichtigungen",
  component: NotificationAdminPage,
});

const stripeSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/abo/success",
  component: StripeSuccessPage,
});

const stripeCancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/abo/cancel",
  component: StripeCancelPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  nutzungsbedingungenRoute,
  registerRoute,
  inviteRoute,
  dashboardRoute,
  kalenderRoute,
  zeitenRoute,
  spesenRoute,
  auswertungenRoute,
  fakturierungRoute,
  invoiceNeuRoute,
  invoiceEditRoute,
  stammdatenRoute,
  einstellungenRoute,
  genehmigungsRoute,
  hrComplianceRoute,
  abwesenheitRoute,
  logoutRoute,
  platformAdminRoute,
  costDashboardRoute,
  notificationsRoute,
  notificationAdminRoute,
  stripeSuccessRoute,
  stripeCancelRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
