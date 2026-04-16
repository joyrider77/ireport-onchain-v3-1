import { a as useNavigate, e as useQueryClient, r as reactExports, j as jsxRuntimeExports } from "./index-CzAnGejr.js";
import { L as Layout, z as Separator } from "./Layout-B1HD-_-K.js";
import { B as Badge } from "./badge-CGQZCl2g.js";
import { B as Button } from "./button-De0KTRQr.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-RwdUJxIK.js";
import { L as Label, I as Input, u as ue } from "./index-DYrEdX2e.js";
import { S as Save, a as Switch } from "./switch-B8-2RgTw.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CbGp-Z-Q.js";
import { a as useAuth } from "./useAuthStore-Ba33VUEX.js";
import { a as useActor, b as useQuery, c as createActor } from "./backend-BNIvB4__.js";
import { u as useMutation } from "./useMutation-DIWQ28Sn.js";
import { c as createLucideIcon } from "./createLucideIcon-B_8OnPXI.js";
import { l as Calendar } from "./users-BqWALrTR.js";
import { L as LoaderCircle } from "./loader-circle-BFgbLaE-.js";
import { I as Info } from "./info-0MSpMvZZ.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ]
];
const Bell = createLucideIcon("bell", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);
const toAny = (a) => a;
function getRoleBadge(role) {
  if (role === "admin")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        className: "bg-primary/10 text-primary border-primary/30",
        variant: "outline",
        children: "Administrator"
      }
    );
  if (role === "manager")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-accent text-accent-foreground", variant: "secondary", children: "Manager" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Mitarbeiter" });
}
function NotificationToggle({
  id,
  label,
  description,
  checked,
  disabled,
  upcoming,
  onCheckedChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: id,
            className: `text-sm font-medium cursor-pointer ${disabled ? "text-muted-foreground" : "text-foreground"}`,
            children: label
          }
        ),
        upcoming && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: "outline",
            className: "text-[10px] px-1.5 py-0 text-muted-foreground border-muted-foreground/30",
            children: "Demnächst verfügbar"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Switch,
      {
        id,
        checked: checked ?? false,
        disabled,
        onCheckedChange,
        "data-ocid": `toggle-${id}`,
        "aria-label": label,
        className: "mt-0.5 shrink-0"
      }
    )
  ] });
}
function EinstellungenPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, role, employeeName, principal } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  reactExports.useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);
  const isAdmin = role === "admin";
  const isManagerOrAdmin = role === "admin" || role === "manager";
  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ["userNotificationSettings"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny(actor).getUserNotificationSettings();
        const r = result;
        return r.__kind__ === "ok" && r.ok ? r.ok : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 3e4
  });
  const [notifForm, setNotifForm] = reactExports.useState({
    emailNewVacationRequest: false,
    emailOnApproval: false
  });
  reactExports.useEffect(() => {
    if (notifData) {
      setNotifForm({
        emailNewVacationRequest: notifData.emailNewVacationRequest,
        emailOnApproval: notifData.emailOnApproval
      });
    }
  }, [notifData]);
  const saveNotifMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Nicht angemeldet");
      const input = notifData ? {
        ...notifData,
        emailNewVacationRequest: notifForm.emailNewVacationRequest,
        emailOnApproval: notifForm.emailOnApproval
      } : {
        emailNewVacationRequest: notifForm.emailNewVacationRequest,
        emailOnApproval: notifForm.emailOnApproval,
        principalId: principal,
        companyId: BigInt(companyId ?? 0)
      };
      const result = await toAny(actor).updateUserNotificationSettings(input);
      const r = result;
      if (r.__kind__ === "err")
        throw new Error(r.err ?? "Fehler beim Speichern");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userNotificationSettings"] });
      ue.success("Benachrichtigungseinstellungen gespeichert");
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
    }
  });
  const { data: companySettingsData, isLoading: companySettingsLoading } = useQuery({
    queryKey: ["companySettings", companyId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny(actor).getCompanySettings();
        const r = result;
        return r.__kind__ === "ok" && r.ok ? r.ok : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && isManagerOrAdmin,
    staleTime: 3e4
  });
  const [vacationForm, setVacationForm] = reactExports.useState({
    maxVacationDays: 25,
    vacationCarryoverDays: 5,
    approvalRequired: true
  });
  reactExports.useEffect(() => {
    if (companySettingsData) {
      setVacationForm({
        maxVacationDays: Number(companySettingsData.maxVacationDays),
        vacationCarryoverDays: Number(
          companySettingsData.vacationCarryoverDays
        ),
        approvalRequired: companySettingsData.approvalRequired
      });
    }
  }, [companySettingsData]);
  const saveVacationMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !companySettingsData) throw new Error("Nicht verfügbar");
      const input = {
        ...companySettingsData,
        maxVacationDays: BigInt(vacationForm.maxVacationDays),
        vacationCarryoverDays: BigInt(vacationForm.vacationCarryoverDays),
        approvalRequired: vacationForm.approvalRequired
      };
      const result = await toAny(actor).updateCompanySettings(input);
      const r = result;
      if (r.__kind__ === "err")
        throw new Error(r.err ?? "Fehler beim Speichern");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings"] });
      ue.success("Ferieneinstellungen gespeichert");
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Einstellungen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Konto- und Unternehmenseinstellungen verwalten" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "benachrichtigungen", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "mb-6 flex-wrap h-auto gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "benachrichtigungen",
            "data-ocid": "tab-benachrichtigungen",
            className: "gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-3.5 h-3.5" }),
              "Benachrichtigungen"
            ]
          }
        ),
        isManagerOrAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "ferien",
            "data-ocid": "tab-ferien",
            className: "gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3.5 h-3.5" }),
              "Ferien & Abwesenheiten"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TabsTrigger,
          {
            value: "profil",
            "data-ocid": "tab-profil",
            className: "gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-3.5 h-3.5" }),
              "Benutzerprofil"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "benachrichtigungen", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "E-Mail Benachrichtigungen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Legen Sie fest, bei welchen Ereignissen Sie eine E-Mail erhalten möchten." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-1", children: notifLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-4 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
            "Einstellungen werden geladen…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NotificationToggle,
              {
                id: "emailNewVacationRequest",
                label: "E-Mail bei neuem Ferienantrag",
                description: "Sie erhalten eine E-Mail, wenn ein neuer Ferienantrag eingereicht wird.",
                checked: notifForm.emailNewVacationRequest,
                onCheckedChange: (v) => setNotifForm((p) => ({
                  ...p,
                  emailNewVacationRequest: v
                }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NotificationToggle,
              {
                id: "emailOnApproval",
                label: "E-Mail bei Genehmigung/Ablehnung",
                description: "Sie erhalten eine E-Mail, wenn Ihr Ferienantrag genehmigt oder abgelehnt wird.",
                checked: notifForm.emailOnApproval,
                onCheckedChange: (v) => setNotifForm((p) => ({ ...p, emailOnApproval: v }))
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-dashed border-muted-foreground/20 bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base text-muted-foreground", children: "Geplante Funktionen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Diese Benachrichtigungsoptionen werden in einer zukünftigen Version verfügbar." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NotificationToggle,
              {
                id: "weeklySummary",
                label: "Wochenzusammenfassung per E-Mail",
                description: "Wöchentliche Zusammenfassung Ihrer Stunden, Spesen und Abwesenheiten.",
                disabled: true,
                upcoming: true
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              NotificationToggle,
              {
                id: "pushNotifications",
                label: "Push-Benachrichtigungen",
                description: "Browser-Benachrichtigungen für wichtige Ereignisse.",
                disabled: true,
                upcoming: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            onClick: () => saveNotifMutation.mutate(),
            disabled: saveNotifMutation.isPending || notifLoading,
            "data-ocid": "save-notifications",
            className: "gap-2",
            children: [
              saveNotifMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              "Benachrichtigungseinstellungen speichern"
            ]
          }
        ) })
      ] }),
      isManagerOrAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "ferien", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Ferieneinstellungen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Legen Sie die Ferienregeln für Ihre Firma fest." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
            !isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-md bg-muted/50 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 mt-0.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nur Admins können diese Einstellungen ändern." })
            ] }),
            companySettingsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 py-4 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
              "Einstellungen werden geladen…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "maxVacationDays", children: "Maximale Ferientage pro Jahr" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "maxVacationDays",
                    type: "number",
                    min: 0,
                    max: 365,
                    value: vacationForm.maxVacationDays,
                    onChange: (e) => setVacationForm((p) => ({
                      ...p,
                      maxVacationDays: Number(e.target.value)
                    })),
                    disabled: !isAdmin,
                    "data-ocid": "input-max-vacation-days"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Gesetzliches Minimum in der Schweiz: 20 Tage" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vacationCarryoverDays", children: "Ferienübertrag (Tage)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "vacationCarryoverDays",
                    type: "number",
                    min: 0,
                    max: 365,
                    value: vacationForm.vacationCarryoverDays,
                    onChange: (e) => setVacationForm((p) => ({
                      ...p,
                      vacationCarryoverDays: Number(e.target.value)
                    })),
                    disabled: !isAdmin,
                    "data-ocid": "input-carryover-days"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Maximale Anzahl übertragbarer Ferientage ins Folgejahr" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 flex items-center justify-between rounded-md border border-input bg-card p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Label,
                    {
                      htmlFor: "approvalRequired",
                      className: `text-sm font-medium ${!isAdmin ? "text-muted-foreground" : "text-foreground"}`,
                      children: "Genehmigung erforderlich"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Ferienanträge müssen von einem Admin oder Manager genehmigt werden." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    id: "approvalRequired",
                    checked: vacationForm.approvalRequired,
                    disabled: !isAdmin,
                    onCheckedChange: (v) => setVacationForm((p) => ({
                      ...p,
                      approvalRequired: v
                    })),
                    "data-ocid": "toggle-approval-required"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            onClick: () => saveVacationMutation.mutate(),
            disabled: saveVacationMutation.isPending || companySettingsLoading,
            "data-ocid": "save-vacation-settings",
            className: "gap-2",
            children: [
              saveVacationMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              "Ferieneinstellungen speichern"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profil", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Benutzerprofil" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Ihre Profildaten werden über Internet Identity verwaltet." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs uppercase tracking-wide", children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: employeeName ?? "–" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs uppercase tracking-wide", children: "Rolle" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: getRoleBadge(role) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground text-xs uppercase tracking-wide", children: "Principal ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-muted-foreground break-all", children: principal ?? "–" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-4 rounded-md bg-secondary/50 border border-secondary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-primary mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-secondary-foreground", children: [
              "Ihr Benutzerprofil wird über",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Internet Identity" }),
              " verwaltet. Um Ihre Identität oder verknüpften Geräte zu ändern, besuchen Sie bitte identity.ic0.app."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: () => window.open(
                "https://identity.ic0.app",
                "_blank",
                "noopener,noreferrer"
              ),
              "data-ocid": "btn-open-internet-identity",
              className: "gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-4 h-4" }),
                "Internet Identity öffnen"
              ]
            }
          )
        ] })
      ] }) })
    ] })
  ] }) });
}
export {
  EinstellungenPage as default
};
