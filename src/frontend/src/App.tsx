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
const StammdatenPage = lazy(() => import("./pages/StammdatenPage"));
const EinstellungenPage = lazy(() => import("./pages/EinstellungenPage"));
const GenehmigungsPage = lazy(() => import("./pages/GenehmigungsPage"));
const AbwesenheitPage = lazy(() => import("./pages/AbwesenheitPage"));
const LogoutPage = lazy(() => import("./pages/LogoutPage"));

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
  stammdatenRoute,
  einstellungenRoute,
  genehmigungsRoute,
  abwesenheitRoute,
  logoutRoute,
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
