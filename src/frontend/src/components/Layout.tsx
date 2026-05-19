import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import {
  BarChart2,
  Bell,
  Building2,
  Calendar,
  CalendarOff,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Database,
  FileText,
  Gift,
  Globe,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Receipt,
  Settings,
  ShieldCheck,
  Tag,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import logoImg from "/assets/ireport_logo.png";
import { createActor } from "../backend";
import type { SubscriptionPlan } from "../backend.d";
import { NotificationBell } from "../components/notifications/NotificationBell";
import { useAuth } from "../hooks/useAuthStore";
import { StopwatchWidget } from "./StopwatchWidget";

const SIDEBAR_STORAGE_KEY = "ireport_sidebar_expanded";

interface StammdatenSubItem {
  label: string;
  tab: string;
  icon: React.ElementType;
}

const stammdatenSubItems: StammdatenSubItem[] = [
  { label: "Firma", tab: "firma", icon: Building2 },
  { label: "Mitarbeiter", tab: "mitarbeiter", icon: Users },
  { label: "Kunden", tab: "kunden", icon: Globe },
  { label: "Projekte", tab: "projekte", icon: FileText },
  { label: "Leistungsarten", tab: "leistungsarten", icon: Wrench },
  { label: "Spesenarten", tab: "spesenarten", icon: Wallet },
  { label: "Abwesenheitsarten", tab: "abwesenheitsarten", icon: CalendarOff },
  { label: "Feiertage", tab: "feiertage", icon: Gift },
  { label: "Rechnungsvorlagen", tab: "rechnungsvorlagen", icon: Receipt },
];

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles?: string[];
}

const topNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Kalenderübersicht", path: "/kalender" },
  { icon: Clock, label: "Zeiten erfassen", path: "/zeiten" },
  { icon: Receipt, label: "Spesen erfassen", path: "/spesen" },
  { icon: BarChart2, label: "Auswertungen", path: "/auswertungen" },
  {
    icon: FileText,
    label: "Fakturierung",
    path: "/fakturierung",
    roles: ["admin", "manager"],
  },
  {
    icon: Tag,
    label: "Genehmigungen",
    path: "/genehmigungen",
    roles: ["admin", "manager"],
  },
  {
    icon: ClipboardCheck,
    label: "HR & Compliance",
    path: "/hr-compliance",
    roles: ["admin", "manager"],
  },
  { icon: Bell, label: "Benachrichtigungen", path: "/benachrichtigungen" },
];

interface LayoutProps {
  children: React.ReactNode;
}

function useSubscriptionPlanBadge() {
  const { actor, isFetching } = useActor(createActor);
  const { companyId: companyIdStr, isPlatformAdmin } = useAuth();

  return useQuery<SubscriptionPlan | null>({
    queryKey: ["headerSubscriptionPlan", companyIdStr],
    queryFn: async () => {
      if (!actor || !companyIdStr) return null;
      try {
        const plan = await actor.getCompanySubscriptionPlan(
          BigInt(companyIdStr),
        );
        return plan ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!companyIdStr && !isPlatformAdmin,
    staleTime: 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function Layout({ children }: LayoutProps) {
  const subscriptionPlanQuery = useSubscriptionPlanBadge();
  const subscriptionPlanName = subscriptionPlanQuery.data?.name ?? null;

  const { actor: planActor, isFetching: planFetching } = useActor(createActor);
  const { role: planRole, isPlatformAdmin: planIsAdmin } = useAuth();
  const { data: planFeatures = [] } = useQuery<string[]>({
    queryKey: ["myPlanFeatures"],
    queryFn: async () =>
      await (
        planActor as unknown as Record<string, () => Promise<string[]>>
      ).getMyPlanFeatures(),
    enabled:
      !!planActor &&
      !planFetching &&
      (planRole as string) !== "platformAdmin" &&
      !planIsAdmin,
    staleTime: 300_000,
  });

  const FEATURE_PATH_MAP: Record<string, string> = {
    dashboard: "/dashboard",
    calendar: "/kalender",
    "time-tracking": "/zeiten",
    "expense-tracking": "/spesen",
    reports: "/auswertungen",
    invoicing: "/fakturierung",
    "master-data": "/stammdaten",
    settings: "/einstellungen",
  };
  const featurePaths = new Set(
    planFeatures.map((k: string) => FEATURE_PATH_MAP[k]).filter(Boolean),
  );

  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });
  const [supportTooltip, setSupportTooltip] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    role,
    companyName,
    companyLogoUrl,
    employeeName,
    logout,
    isPlatformAdmin,
  } = useAuth();
  // Persist sidebar state whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarExpanded));
    } catch {
      // ignore
    }
  }, [sidebarExpanded]);

  const userRole = role ?? "employee";
  const visibleNav = topNavItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const featureFilteredNav =
    planFeatures.length > 0 &&
    (userRole as string) !== "platformAdmin" &&
    !isPlatformAdmin
      ? visibleNav.filter((item) => {
          const itemPath = item.path || "";
          const isMappedPath =
            Object.values(FEATURE_PATH_MAP).includes(itemPath);
          return !isMappedPath || featurePaths.has(itemPath);
        })
      : visibleNav;

  const isAdminOrManager = userRole === "admin" || userRole === "manager";

  const isStammdatenActive =
    location.pathname === "/stammdaten" ||
    location.pathname.startsWith("/stammdaten");

  // Accordion is open whenever we are on the stammdaten route
  const stammdatenOpen = isStammdatenActive;

  const routeSearch = useSearch({ strict: false }) as { tab?: string };
  const activeTab = routeSearch.tab ?? null;

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const handleStammdatenSubNav = (tab: string) => {
    navigate({ to: "/stammdaten", search: { tab } });
  };

  const navButtonClass = (isActive: boolean, collapsed: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-muted hover:text-foreground"
    } ${collapsed ? "justify-center" : "justify-start"}`;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <aside
          data-ocid="sidebar"
          className={`flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out ${
            sidebarExpanded ? "w-60" : "w-[60px]"
          } flex-shrink-0 relative z-30`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-[60px] px-3 border-b border-border">
            <a
              href="https://www.ireport.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center min-w-0"
              aria-label="iReport"
            >
              <img
                src={logoImg}
                alt="iReport"
                className={`object-contain transition-all duration-300 ${sidebarExpanded ? "h-10 max-w-[140px]" : "h-8 w-8 max-w-[40px]"}`}
              />
            </a>
            <button
              type="button"
              data-ocid="sidebar-toggle"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors ml-auto text-muted-foreground hover:text-foreground flex-shrink-0"
              aria-label={
                sidebarExpanded ? "Sidebar einklappen" : "Sidebar ausklappen"
              }
            >
              {sidebarExpanded ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-1">
            {/* Top nav items */}
            {featureFilteredNav.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              const navButton = (
                <button
                  type="button"
                  key={item.path}
                  data-ocid={`nav-${item.path.replace("/", "")}`}
                  onClick={() => navigate({ to: item.path })}
                  className={navButtonClass(isActive, !sidebarExpanded)}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarExpanded && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );

              return sidebarExpanded ? (
                navButton
              ) : (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}

            {/* Stammdaten accordion — only for admin/manager */}
            {isAdminOrManager &&
              (sidebarExpanded ? (
                <div>
                  <button
                    type="button"
                    data-ocid="nav-stammdaten"
                    onClick={() => {
                      navigate({
                        to: "/stammdaten",
                        search: { tab: "mitarbeiter" },
                      });
                    }}
                    className={navButtonClass(isStammdatenActive, false)}
                  >
                    <Database className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate flex-1 text-left">
                      Stammdaten
                    </span>
                    {stammdatenOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                    )}
                  </button>

                  {/* Sub-items */}
                  {stammdatenOpen && (
                    <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-primary/20 pl-2">
                      {stammdatenSubItems.map((sub) => {
                        const isSubActive =
                          isStammdatenActive && activeTab === sub.tab;
                        const SubIcon = sub.icon;
                        return (
                          <button
                            type="button"
                            key={sub.tab}
                            data-ocid={`nav-stammdaten-${sub.tab}`}
                            onClick={() => handleStammdatenSubNav(sub.tab)}
                            className={`w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-xs font-medium ${
                              isSubActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      data-ocid="nav-stammdaten"
                      onClick={() => {
                        navigate({
                          to: "/stammdaten",
                          search: { tab: "mitarbeiter" },
                        });
                      }}
                      className={navButtonClass(isStammdatenActive, true)}
                    >
                      <Database className="w-4 h-4 flex-shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Stammdaten</TooltipContent>
                </Tooltip>
              ))}

            {/* Einstellungen */}
            {sidebarExpanded ? (
              <button
                type="button"
                data-ocid="nav-einstellungen"
                onClick={() => navigate({ to: "/einstellungen" })}
                className={navButtonClass(
                  location.pathname === "/einstellungen",
                  false,
                )}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Einstellungen</span>
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    data-ocid="nav-einstellungen"
                    onClick={() => navigate({ to: "/einstellungen" })}
                    className={navButtonClass(
                      location.pathname === "/einstellungen",
                      true,
                    )}
                  >
                    <Settings className="w-4 h-4 flex-shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Einstellungen</TooltipContent>
              </Tooltip>
            )}

            {/* Platform-Admin (nur für Platform Admin) */}
            {isPlatformAdmin &&
              (sidebarExpanded ? (
                <>
                  <Separator className="my-1" />
                  <button
                    type="button"
                    data-ocid="nav-platform-admin"
                    onClick={() => navigate({ to: "/platform-admin" })}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium justify-start ${
                      location.pathname === "/platform-admin"
                        ? "bg-primary text-primary-foreground"
                        : "text-primary hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Platform-Admin</span>
                  </button>
                  <button
                    type="button"
                    data-ocid="nav-kosten-dashboard"
                    onClick={() => navigate({ to: "/kosten-dashboard" })}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium justify-start ${
                      location.pathname === "/kosten-dashboard"
                        ? "bg-primary text-primary-foreground"
                        : "text-primary hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <BarChart2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Kosten-Dashboard</span>
                  </button>
                  <button
                    type="button"
                    data-ocid="nav-notification-admin"
                    onClick={() =>
                      navigate({ to: "/platform-admin/benachrichtigungen" })
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium justify-start ${
                      location.pathname === "/platform-admin/benachrichtigungen"
                        ? "bg-primary text-primary-foreground"
                        : "text-primary hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <Bell className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Nachrichtenverwaltung</span>
                  </button>
                </>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        data-ocid="nav-platform-admin"
                        onClick={() => navigate({ to: "/platform-admin" })}
                        className={`w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                          location.pathname === "/platform-admin"
                            ? "bg-primary text-primary-foreground"
                            : "text-primary hover:bg-primary/10"
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Platform-Admin</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        data-ocid="nav-kosten-dashboard"
                        onClick={() => navigate({ to: "/kosten-dashboard" })}
                        className={`w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                          location.pathname === "/kosten-dashboard"
                            ? "bg-primary text-primary-foreground"
                            : "text-primary hover:bg-primary/10"
                        }`}
                      >
                        <BarChart2 className="w-4 h-4 flex-shrink-0" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Kosten-Dashboard
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        data-ocid="nav-notification-admin"
                        onClick={() =>
                          navigate({ to: "/platform-admin/benachrichtigungen" })
                        }
                        className={`w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                          location.pathname ===
                          "/platform-admin/benachrichtigungen"
                            ? "bg-primary text-primary-foreground"
                            : "text-primary hover:bg-primary/10"
                        }`}
                      >
                        <Bell className="w-4 h-4 flex-shrink-0" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Nachrichtenverwaltung
                    </TooltipContent>
                  </Tooltip>
                </>
              ))}
          </nav>

          {/* Bottom: Logout */}
          <div className="border-t border-border px-1 py-2">
            <Separator className="mb-2" />
            {sidebarExpanded ? (
              <button
                type="button"
                data-ocid="nav-logout"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>Abmelden</span>
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    data-ocid="nav-logout"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Abmelden</TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>

        {/* Main area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Fixed Header */}
          <header
            data-ocid="header"
            className="flex items-center justify-between h-[60px] px-4 bg-card border-b border-border shadow-xs flex-shrink-0 z-20"
          >
            {/* Logo / Company name */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Company logo left of company name (only if set) */}
              {companyLogoUrl && !isPlatformAdmin && (
                <img
                  src={companyLogoUrl}
                  alt={companyName ?? "Firmenlogo"}
                  className="h-8 object-contain flex-shrink-0"
                  style={{ maxWidth: "80px" }}
                />
              )}
              {companyName && (
                <span className="font-display font-semibold text-sm text-foreground truncate max-w-[180px]">
                  {companyName}
                </span>
              )}
              {subscriptionPlanName && !isPlatformAdmin && (
                <span
                  data-ocid="header.subscription_plan_badge"
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{ backgroundColor: "#006066", color: "#ffffff" }}
                >
                  {subscriptionPlanName}
                </span>
              )}
            </div>

            {/* User area */}
            <div className="flex items-center gap-3">
              <StopwatchWidget />
              <NotificationBell />
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {getInitials(employeeName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col leading-tight">
                  <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                    {employeeName ?? "Benutzer"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {userRole === "admin"
                      ? "Administrator"
                      : userRole === "manager"
                        ? "Manager"
                        : "Mitarbeiter"}
                  </span>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    data-ocid="header-logout"
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="w-8 h-8 text-muted-foreground hover:text-destructive"
                    aria-label="Abmelden"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Abmelden</TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
        </div>

        {/* Floating support chat */}
        <div className="fixed bottom-6 right-6 z-50 no-print">
          <Tooltip open={supportTooltip} onOpenChange={setSupportTooltip}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-ocid="support-chat"
                onClick={() => setSupportTooltip(!supportTooltip)}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center hover:opacity-90 transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Support"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-sm">
              Support kommt bald!
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
