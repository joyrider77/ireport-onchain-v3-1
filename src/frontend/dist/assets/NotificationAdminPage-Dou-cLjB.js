import { r as reactExports, j as jsxRuntimeExports, S as Skeleton, d as useQueryClient } from "./index-Blf-A8DR.js";
import { B as Badge } from "./badge-BrNtKZcv.js";
import { B as Button } from "./button-DCGMFvti.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-CHW-R_CT.js";
import { j as Checkbox, X, U as NotificationStatus, K as NotificationPriority, N as NotificationFormat, q as useMutation, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, Y as NotificationTargetType, L as Layout, G as Bell, D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle } from "./Layout-ClH0znk9.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Dp2E-W7o.js";
import { u as useActor, d as useQuery, c as createActor, b as useAuth } from "./useAuthStore-Cbv7GIMf.js";
import { L as Label, I as Input, u as ue } from "./index-CVvtv_EE.js";
import { T as Textarea } from "./textarea-1rE5PUZ-.js";
import { S as Search } from "./search-C7RKaL9F.js";
import { C as CircleAlert } from "./circle-alert-jb_j1SyN.js";
import { E as EyeOff } from "./eye-off-DijXlJja.js";
import { E as Eye } from "./eye-C7GH0ldm.js";
import { S as Save } from "./save-Bo101srK.js";
import { S as Send } from "./send-ZOqThWmv.js";
import { P as Plus } from "./plus-DRvlFs_3.js";
import { C as Copy } from "./copy-xfnVt7hu.js";
import { c as createLucideIcon } from "./createLucideIcon-BzNCDVU7.js";
import "./index-Dv8dTxpA.js";
import "./users-DUrIKgtR.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }],
  ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }],
  ["path", { d: "M10 12h4", key: "a56b0p" }]
];
const Archive = createLucideIcon("archive", __iconNode);
const ROLES = [
  { id: "admin", label: "Administrator" },
  { id: "manager", label: "Manager" },
  { id: "employee", label: "Mitarbeiter" }
];
function RecipientSelector({ value, onChange }) {
  const { actor, isFetching } = useActor(createActor);
  const anyActor = actor;
  const [userSearch, setUserSearch] = reactExports.useState("");
  const { data: companies = [] } = useQuery({
    queryKey: ["allCompaniesForAdmin"],
    queryFn: async () => {
      if (!anyActor) return [];
      const res = await anyActor.listAllCompaniesForPlatformAdmin();
      return res.map((c) => ({
        id: String(c.id),
        name: c.name,
        activeEmployeeCount: c.activeEmployeeCount
      }));
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  const {
    data: allUsers = [],
    isLoading: usersLoading,
    isError: usersError
  } = useQuery({
    queryKey: ["allUsersForNotifications"],
    queryFn: async () => {
      if (!anyActor || companies.length === 0) return [];
      const results = await Promise.all(
        companies.map(async (company) => {
          try {
            const users = await anyActor.getUsersForCompany(BigInt(company.id));
            return users.filter((u) => u.isActive).map(
              (u) => ({
                userId: String(u.id),
                displayName: `${u.firstName} ${u.lastName}`,
                companyName: company.name
              })
            );
          } catch {
            return [];
          }
        })
      );
      const seen = /* @__PURE__ */ new Set();
      return results.flat().filter((u) => {
        if (seen.has(u.userId)) return false;
        seen.add(u.userId);
        return true;
      });
    },
    // Only run once companies are loaded
    enabled: !!actor && !isFetching && companies.length > 0,
    staleTime: 12e4
  });
  const filteredUsers = reactExports.useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return allUsers;
    return allUsers.filter(
      (u) => u.displayName.toLowerCase().includes(q) || u.companyName.toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);
  function toggleTenant(id) {
    const next = value.tenantIds.includes(id) ? value.tenantIds.filter((t) => t !== id) : [...value.tenantIds, id];
    onChange({ ...value, tenantIds: next });
  }
  function toggleRole(id) {
    const next = value.roleIds.includes(id) ? value.roleIds.filter((r) => r !== id) : [...value.roleIds, id];
    onChange({ ...value, roleIds: next });
  }
  function toggleUser(userId) {
    const next = value.userIds.includes(userId) ? value.userIds.filter((u) => u !== userId) : [...value.userIds, userId];
    onChange({ ...value, userIds: next });
  }
  function removeUser(userId) {
    onChange({ ...value, userIds: value.userIds.filter((u) => u !== userId) });
  }
  const selectedUserObjects = allUsers.filter(
    (u) => value.userIds.includes(u.userId)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", "data-ocid": "recipient-selector", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium block mb-2", children: "Mandanten / Firmen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-40 overflow-y-auto border border-border rounded-md p-2 space-y-1", children: companies.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center py-3", children: "Keine Firmen gefunden" }) : companies.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-2 cursor-pointer hover:bg-muted/30 px-1 py-0.5 rounded",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                id: `tenant-${c.id}`,
                checked: value.tenantIds.includes(c.id),
                onCheckedChange: () => toggleTenant(c.id),
                "data-ocid": `recipient.tenant.${c.id}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                htmlFor: `tenant-${c.id}`,
                className: "text-sm cursor-pointer flex-1",
                children: [
                  c.name,
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground ml-1.5", children: [
                    "(",
                    Number(c.activeEmployeeCount),
                    " aktiv)"
                  ] })
                ]
              }
            )
          ]
        },
        c.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium block mb-2", children: "Rollen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-3", children: ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            id: `role-${r.id}`,
            checked: value.roleIds.includes(r.id),
            onCheckedChange: () => toggleRole(r.id),
            "data-ocid": `recipient.role.${r.id}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "label",
          {
            htmlFor: `role-${r.id}`,
            className: "text-sm cursor-pointer",
            children: r.label
          }
        )
      ] }, r.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium block mb-2", children: "Direkte Benutzer" }),
      selectedUserObjects.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "flex flex-wrap gap-1.5 mb-2",
          "data-ocid": "recipient.selected_users",
          children: selectedUserObjects.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: "secondary",
              className: "text-xs flex items-center gap-1 pl-2 pr-1 py-0.5",
              children: [
                u.displayName,
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  "(",
                  u.companyName,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "aria-label": `${u.displayName} entfernen`,
                    onClick: () => removeUser(u.userId),
                    className: "ml-0.5 hover:text-destructive transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
                  }
                )
              ]
            },
            u.userId
          ))
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-md overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-2 border-b border-border bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Search,
            {
              className: "w-3.5 h-3.5 text-muted-foreground flex-shrink-0",
              "aria-hidden": "true"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "recipient.user_search_input",
              value: userSearch,
              onChange: (e) => setUserSearch(e.target.value),
              placeholder: "Benutzer suchen\\u2026",
              className: "border-0 bg-transparent h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 overflow-y-auto p-2 space-y-1", children: usersLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-5/6" })
        ] }) : usersError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-destructive py-3 px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3.5 h-3.5 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Benutzer konnten nicht geladen werden" })
        ] }) : allUsers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center py-3", children: "Keine Benutzer verfügbar" }) : filteredUsers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center py-3", children: "Keine Benutzer gefunden" }) : filteredUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2 cursor-pointer hover:bg-muted/30 px-1 py-0.5 rounded",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  id: `user-${u.userId}`,
                  checked: value.userIds.includes(u.userId),
                  onCheckedChange: () => toggleUser(u.userId),
                  "data-ocid": `recipient.user.${u.userId}`
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "label",
                {
                  htmlFor: `user-${u.userId}`,
                  className: "text-sm cursor-pointer flex-1 min-w-0",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: u.displayName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground ml-1.5 text-xs", children: u.companyName })
                  ]
                }
              )
            ]
          },
          u.userId
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: value.tenantIds.length }),
      " ",
      "Firmen,",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: value.roleIds.length }),
      " ",
      "Rollen,",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: value.userIds.length }),
      " ",
      "direkte Benutzer"
    ] })
  ] });
}
function formatInputToNanos(dateStr) {
  return dateStr ? BigInt(new Date(dateStr).getTime()) * 1000000n : BigInt(Date.now()) * 1000000n;
}
function NotificationEditor({
  onClose,
  initialData
}) {
  const { actor, isFetching } = useActor(createActor);
  const anyActor = actor;
  const qc = useQueryClient();
  const isDraftEdit = !!initialData && initialData.status === NotificationStatus.draft;
  const [title, setTitle] = reactExports.useState((initialData == null ? void 0 : initialData.title) ?? "");
  const [priority, setPriority] = reactExports.useState(
    (initialData == null ? void 0 : initialData.priority) ?? NotificationPriority.normal
  );
  const [validFrom, setValidFrom] = reactExports.useState(() => {
    if (initialData == null ? void 0 : initialData.validFrom) {
      const d = new Date(Number(initialData.validFrom) / 1e6);
      return d.toISOString().split("T")[0];
    }
    return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  });
  const [validUntil, setValidUntil] = reactExports.useState(() => {
    if (initialData == null ? void 0 : initialData.validUntil) {
      const d = new Date(Number(initialData.validUntil) / 1e6);
      return d.toISOString().split("T")[0];
    }
    return "";
  });
  const [format, setFormat] = reactExports.useState(
    (initialData == null ? void 0 : initialData.messageFormat) ?? NotificationFormat.markdown
  );
  const [body, setBody] = reactExports.useState((initialData == null ? void 0 : initialData.messageBody) ?? "");
  const [recipients, setRecipients] = reactExports.useState({
    tenantIds: (initialData == null ? void 0 : initialData.targetTenantIds) ?? [],
    roleIds: (initialData == null ? void 0 : initialData.targetRoleIds) ?? [],
    userIds: (initialData == null ? void 0 : initialData.targetUserIds) ?? []
  });
  const [preview, setPreview] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const { data: companies = [] } = useQuery({
    queryKey: ["allCompaniesForAdmin"],
    queryFn: async () => {
      if (!anyActor) return [];
      const res = await anyActor.listAllCompaniesForPlatformAdmin();
      return res.map((c) => ({
        id: String(c.id),
        name: c.name,
        activeEmployeeCount: c.activeEmployeeCount
      }));
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  const estimatedRecipients = (() => {
    const directCount = recipients.userIds.length;
    const tenantCount = companies.filter((c) => recipients.tenantIds.includes(c.id)).reduce((sum, c) => sum + Number(c.activeEmployeeCount), 0);
    const allActiveUsers = companies.reduce(
      (sum, c) => sum + Number(c.activeEmployeeCount),
      0
    );
    const roleCount = recipients.roleIds.length > 0 ? Math.ceil(allActiveUsers * (recipients.roleIds.length / 3)) : 0;
    return Math.max(directCount, tenantCount + roleCount);
  })();
  function validate() {
    const e = {};
    if (!title.trim()) e.title = "Titel ist Pflichtfeld";
    if (!validFrom) e.validFrom = "Gültig ab ist Pflichtfeld";
    if (recipients.tenantIds.length === 0 && recipients.roleIds.length === 0 && recipients.userIds.length === 0) {
      e.recipients = "Mindestens einen Empfänger auswählen";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  function buildTargetType() {
    const hasTenant = recipients.tenantIds.length > 0;
    const hasRole = recipients.roleIds.length > 0;
    const hasUser = recipients.userIds.length > 0;
    if ([hasTenant, hasRole, hasUser].filter(Boolean).length > 1)
      return NotificationTargetType.mixed;
    if (hasTenant) return NotificationTargetType.tenant;
    if (hasRole) return NotificationTargetType.role;
    return NotificationTargetType.user;
  }
  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["allNotifications"] });
    qc.invalidateQueries({ queryKey: ["myNotifications"] });
    qc.invalidateQueries({ queryKey: ["unreadCount"] });
  }
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!anyActor) throw new Error("Kein Actor");
      const res = await anyActor.createNotificationDraft(
        title,
        body,
        format,
        priority,
        formatInputToNanos(validFrom),
        validUntil ? formatInputToNanos(validUntil) : null,
        buildTargetType(),
        recipients.tenantIds,
        recipients.roleIds,
        recipients.userIds
      );
      const r = res;
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
    },
    onSuccess: () => {
      ue.success("Entwurf gespeichert");
      invalidateAll();
      onClose();
    },
    onError: (e) => ue.error(e.message)
  });
  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!anyActor) throw new Error("Kein Actor");
      const res = await anyActor.saveAndSendNotification(
        title,
        body,
        format,
        priority,
        formatInputToNanos(validFrom),
        validUntil ? formatInputToNanos(validUntil) : null,
        buildTargetType(),
        recipients.tenantIds,
        recipients.roleIds,
        recipients.userIds
      );
      const r = res;
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
    },
    onSuccess: () => {
      ue.success("Nachricht gesendet");
      invalidateAll();
      onClose();
    },
    onError: (e) => ue.error(e.message)
  });
  const isSubmitting = saveDraftMutation.isPending || sendMutation.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", "data-ocid": "notification-editor", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: isDraftEdit ? "Entwurf bearbeiten" : "Neue Nachricht" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "ghost",
          size: "icon",
          onClick: onClose,
          "data-ocid": "notification-editor.close_button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notif-title", children: "Titel / Betreff *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "notif-title",
            "data-ocid": "notification-editor.title_input",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: "Betreff der Nachricht"
          }
        ),
        errors.title && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.title })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Priorität" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: priority, onValueChange: setPriority, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "notification-editor.priority_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: NotificationPriority.normal, children: "Normal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: NotificationPriority.important, children: "Wichtig" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: NotificationPriority.critical, children: "Kritisch" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Format" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: format, onValueChange: setFormat, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "notification-editor.format_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: NotificationFormat.markdown, children: "Markdown" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: NotificationFormat.html, children: "HTML" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notif-validFrom", children: "Gültig ab *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "notif-validFrom",
              type: "date",
              "data-ocid": "notification-editor.valid_from_input",
              value: validFrom,
              onChange: (e) => setValidFrom(e.target.value)
            }
          ),
          errors.validFrom && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.validFrom })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notif-validUntil", children: "Gültig bis (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "notif-validUntil",
              type: "date",
              "data-ocid": "notification-editor.valid_until_input",
              value: validUntil,
              onChange: (e) => setValidUntil(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notif-body", children: "Nachrichteninhalt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "text-xs text-primary hover:underline flex items-center gap-1",
              onClick: () => setPreview((v) => !v),
              "data-ocid": "notification-editor.preview_toggle",
              children: [
                preview ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }),
                preview ? "Bearbeiten" : "Vorschau"
              ]
            }
          )
        ] }),
        preview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "min-h-[120px] border border-border rounded-md p-3 text-sm text-foreground bg-muted/20 prose prose-sm max-w-none",
            dangerouslySetInnerHTML: {
              __html: format === NotificationFormat.html ? body.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/on\w+\s*=\s*(["'])[^"']*\1/gi, "") : `<p>${body.replace(/\n/g, "<br />")}</p>`
            }
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "notif-body",
            "data-ocid": "notification-editor.body_textarea",
            value: body,
            onChange: (e) => setBody(e.target.value),
            rows: 6,
            placeholder: format === NotificationFormat.markdown ? "**Fettschrift**, *Kursiv*, # Überschrift" : "<p>HTML-Inhalt</p>"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Empfänger *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RecipientSelector, { value: recipients, onChange: setRecipients }),
        errors.recipients && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.recipients }),
        (recipients.tenantIds.length > 0 || recipients.roleIds.length > 0 || recipients.userIds.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Geschätzt",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: estimatedRecipients }),
          " ",
          "Empfänger"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-3 pt-2 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: onClose,
          disabled: isSubmitting,
          "data-ocid": "notification-editor.cancel_button",
          children: "Abbrechen"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          variant: "outline",
          className: "gap-1.5",
          onClick: () => {
            if (validate()) saveDraftMutation.mutate();
          },
          disabled: isSubmitting,
          "data-ocid": "notification-editor.save_draft_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
            "Entwurf"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          className: "gap-1.5",
          onClick: () => {
            if (validate()) sendMutation.mutate();
          },
          disabled: isSubmitting,
          "data-ocid": "notification-editor.send_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4" }),
            sendMutation.isPending ? "Sendet..." : "Senden"
          ]
        }
      )
    ] })
  ] });
}
function formatNanos(ns) {
  const d = new Date(Number(ns) / 1e6);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
function statusBadge(status) {
  if (status === NotificationStatus.sent)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-green-100 text-green-800 border-green-300", children: "Versendet" });
  if (status === NotificationStatus.archived)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "Archiviert" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Entwurf" });
}
function priorityBadge(priority) {
  if (priority === NotificationPriority.critical)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-xs", children: "Kritisch" });
  if (priority === NotificationPriority.important)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-amber-100 text-amber-800 border-amber-300", children: "Wichtig" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "Normal" });
}
function renderMarkdown(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(
    /^### (.+)$/gm,
    "<h3 class='font-semibold text-base mt-3 mb-1'>$1</h3>"
  ).replace(
    /^## (.+)$/gm,
    "<h2 class='font-semibold text-lg mt-4 mb-1'>$1</h2>"
  ).replace(/^# (.+)$/gm, "<h1 class='font-bold text-xl mt-4 mb-2'>$1</h1>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>").replace(
    /\[(.+?)\]\((.+?)\)/g,
    "<a href='$2' class='text-primary underline' target='_blank' rel='noreferrer'>$1</a>"
  ).replace(/\n\n/g, "</p><p class='mt-2'>").replace(/\n/g, "<br />");
}
function sanitizeHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/on\w+\s*=\s*(["'])[^"']*\1/gi, "").replace(/javascript:/gi, "");
}
function NotificationViewModal({
  notification,
  onClose,
  onDuplicate
}) {
  const n = notification;
  const renderedContent = reactExports.useMemo(() => {
    if (n.messageFormat === NotificationFormat.html) {
      return { __html: sanitizeHtml(n.messageBody) };
    }
    return { __html: `<p class='mt-1'>${renderMarkdown(n.messageBody)}</p>` };
  }, [n.messageBody, n.messageFormat]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open: true,
      onOpenChange: (open) => {
        if (!open) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogContent,
        {
          className: "max-w-2xl max-h-[80vh] overflow-y-auto",
          "data-ocid": "notification-admin.view_modal",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 pr-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-base leading-tight flex-1", children: n.title }),
                priorityBadge(n.priority)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1", children: [
                statusBadge(n.status),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  "Von ",
                  n.senderDisplayName,
                  " · ",
                  formatNanos(n.createdAt)
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "text-sm text-foreground prose prose-sm max-w-none py-2",
                dangerouslySetInnerHTML: renderedContent
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-3 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  size: "sm",
                  className: "gap-1.5",
                  onClick: () => {
                    onDuplicate(n.id);
                    onClose();
                  },
                  "data-ocid": "notification-admin.view_modal.duplicate_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3.5 h-3.5" }),
                    "Duplizieren"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  size: "sm",
                  onClick: onClose,
                  "data-ocid": "notification-admin.view_modal.close_button",
                  children: "Schließen"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function NotificationAdminPage() {
  const { isPlatformAdmin } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const anyActor = actor;
  const qc = useQueryClient();
  const [showEditor, setShowEditor] = reactExports.useState(false);
  const [editDraft, setEditDraft] = reactExports.useState(null);
  const [viewNotification, setViewNotification] = reactExports.useState(
    null
  );
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["allNotifications"],
    queryFn: async () => {
      if (!anyActor) return [];
      const res = await anyActor.listAllNotifications();
      return res.sort(
        (a, b) => Number(b.createdAt - a.createdAt)
      );
    },
    enabled: !!actor && !isFetching && isPlatformAdmin,
    staleTime: 3e4
  });
  const archiveMutation = useMutation({
    mutationFn: async (id) => {
      if (!anyActor) throw new Error("Kein Actor");
      const res = await anyActor.archiveNotification(id);
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      ue.success("Archiviert");
      qc.invalidateQueries({ queryKey: ["allNotifications"] });
    },
    onError: (e) => ue.error(e.message)
  });
  const duplicateMutation = useMutation({
    mutationFn: async (id) => {
      if (!anyActor) throw new Error("Kein Actor");
      const res = await anyActor.duplicateNotification(id);
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      ue.success("Dupliziert");
      qc.invalidateQueries({ queryKey: ["allNotifications"] });
    },
    onError: (e) => ue.error(e.message)
  });
  function openRow(n) {
    if (n.status === NotificationStatus.draft) {
      setEditDraft(n);
      setShowEditor(false);
      setViewNotification(null);
    } else {
      setViewNotification(n);
    }
  }
  if (!isPlatformAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Kein Zugriff." }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-semibold text-foreground", children: "Nachrichtenverwaltung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Benachrichtigungen erstellen und versenden" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          className: "gap-2",
          onClick: () => {
            setShowEditor(true);
            setEditDraft(null);
            setViewNotification(null);
          },
          "data-ocid": "notification-admin.new_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Neue Nachricht"
          ]
        }
      )
    ] }),
    (showEditor || editDraft) && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      NotificationEditor,
      {
        initialData: editDraft ?? void 0,
        onClose: () => {
          setShowEditor(false);
          setEditDraft(null);
        }
      }
    ) }) }),
    viewNotification && /* @__PURE__ */ jsxRuntimeExports.jsx(
      NotificationViewModal,
      {
        notification: viewNotification,
        onClose: () => setViewNotification(null),
        onDuplicate: (id) => duplicateMutation.mutate(id)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Erstellte Nachrichten" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
          notifications.length,
          " Einträge"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" })
      ] }) : notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground",
          "data-ocid": "notification-admin.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-8 h-8 opacity-40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Noch keine Nachrichten erstellt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                onClick: () => {
                  setShowEditor(true);
                  setEditDraft(null);
                },
                children: "Erste Nachricht erstellen"
              }
            )
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Titel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Ersteller" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Erstellt am" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Priorität" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: notifications.map((n, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            className: "cursor-pointer hover:bg-muted/40",
            onClick: () => openRow(n),
            "data-ocid": `notification-admin.item.${idx + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium max-w-[200px] truncate", children: n.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm text-muted-foreground", children: n.senderDisplayName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: formatNanos(n.createdAt) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: priorityBadge(n.priority) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: statusBadge(n.status) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center justify-end gap-1",
                  onClick: (e) => e.stopPropagation(),
                  onKeyDown: (e) => e.stopPropagation(),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        className: "h-7 w-7",
                        title: "Ansehen",
                        onClick: (e) => {
                          e.stopPropagation();
                          openRow(n);
                        },
                        "data-ocid": `notification-admin.view_button.${idx + 1}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        className: "h-7 w-7",
                        title: "Duplizieren",
                        onClick: () => duplicateMutation.mutate(n.id),
                        disabled: duplicateMutation.isPending,
                        "data-ocid": `notification-admin.duplicate_button.${idx + 1}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3.5 h-3.5" })
                      }
                    ),
                    n.status === NotificationStatus.sent && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        className: "h-7 w-7 text-muted-foreground",
                        title: "Archivieren",
                        onClick: () => archiveMutation.mutate(n.id),
                        disabled: archiveMutation.isPending,
                        "data-ocid": `notification-admin.archive_button.${idx + 1}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-3.5 h-3.5" })
                      }
                    )
                  ]
                }
              ) })
            ]
          },
          n.id
        )) })
      ] }) }) })
    ] })
  ] }) });
}
export {
  NotificationAdminPage as default
};
