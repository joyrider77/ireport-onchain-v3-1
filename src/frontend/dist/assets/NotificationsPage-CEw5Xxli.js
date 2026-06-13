import { r as reactExports, j as jsxRuntimeExports, e as useQueryClient, S as Skeleton } from "./index-D_yjRFGt.js";
import { B as Button } from "./button-BXNzWYpr.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-Cqx-QXhC.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-BXMAOymm.js";
import { u as useActor, b as useQuery, c as createActor } from "./useAuthStore-RPelH0kd.js";
import { N as NotificationFormat, M as NotificationPriority, q as useMutation, L as Layout, H as Bell, R as RefreshCw, Q as NotificationItem } from "./Layout-BOoVnXJI.js";
import { B as Badge } from "./badge-BPk2SywW.js";
import { A as ArrowLeft } from "./arrow-left-DwEQQdCE.js";
import { T as Trash2 } from "./trash-2-DpHAoxHy.js";
import { c as createLucideIcon } from "./createLucideIcon-C599ATMm.js";
import "./index-HGa3Ynxo.js";
import "./x-BHvIGru9.js";
import "./index-SoMYIp0N.js";
import "./loader-circle-DPIlcj_m.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M18 6 7 17l-5-5", key: "116fxf" }],
  ["path", { d: "m22 10-7.5 7.5L13 16", key: "ke71qq" }]
];
const CheckCheck = createLucideIcon("check-check", __iconNode);
function formatNanos(ns) {
  const d = new Date(Number(ns) / 1e6);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function renderMarkdown(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(
    /^### (.+)$/gm,
    "<h3 class='font-semibold text-base mt-3 mb-1'>$1</h3>"
  ).replace(
    /^## (.+)$/gm,
    "<h2 class='font-semibold text-lg mt-4 mb-1'>$1</h2>"
  ).replace(/^# (.+)$/gm, "<h1 class='font-bold text-xl mt-4 mb-2'>$1</h1>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>").replace(/(<li[^>]*>.*<\/li>\n?)+/g, "<ul class='my-2'>$&</ul>").replace(
    /\[(.+?)\]\((.+?)\)/g,
    "<a href='$2' class='text-primary underline' target='_blank' rel='noreferrer'>$1</a>"
  ).replace(/\n\n/g, "</p><p class='mt-2'>").replace(/\n/g, "<br />");
}
function sanitizeHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/on\w+\s*=\s*(["'])[^"']*\1/gi, "").replace(/javascript:/gi, "").replace(/vbscript:/gi, "");
}
function priorityBadge(priority) {
  if (priority === NotificationPriority.critical)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-xs", children: "Kritisch" });
  if (priority === NotificationPriority.important)
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-amber-100 text-amber-800 border-amber-300", children: "Wichtig" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "Normal" });
}
function NotificationDetail({
  notification,
  onBack,
  onDelete,
  onRead
}) {
  const { notification: n, isRead } = notification;
  const renderedContent = reactExports.useMemo(() => {
    if (n.messageFormat === NotificationFormat.html) {
      return { __html: sanitizeHtml(n.messageBody) };
    }
    return { __html: `<p class='mt-1'>${renderMarkdown(n.messageBody)}</p>` };
  }, [n.messageBody, n.messageFormat]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", "data-ocid": "notification.detail", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold leading-tight", children: n.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "Von ",
          n.senderDisplayName,
          " · ",
          formatNanos(n.createdAt)
        ] })
      ] }),
      priorityBadge(n.priority)
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "text-sm text-foreground prose prose-sm max-w-none",
          dangerouslySetInnerHTML: renderedContent
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-2 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            className: "gap-1.5",
            onClick: onBack,
            "data-ocid": "notification.detail.back_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-3.5 h-3.5" }),
              "Zurück"
            ]
          }
        ),
        !isRead && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            onClick: () => onRead(n.id),
            "data-ocid": "notification.detail.read_button",
            children: "Als gelesen markieren"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            className: "text-destructive hover:text-destructive gap-1.5",
            onClick: () => onDelete(n.id),
            "data-ocid": "notification.detail.delete_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
              "Löschen"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function NotificationsPage() {
  const { actor, isFetching } = useActor(createActor);
  const anyActor = actor;
  const qc = useQueryClient();
  const [filter, setFilter] = reactExports.useState("all");
  const [selected, setSelected] = reactExports.useState(null);
  const {
    data: notifications = [],
    isLoading,
    isFetching: isRefetching,
    refetch
  } = useQuery({
    queryKey: ["myNotifications"],
    queryFn: async () => {
      if (!anyActor) return [];
      const res = await anyActor.listMyNotifications();
      return res.filter((n) => !n.isDeleted).sort(
        (a, b) => Number(b.notification.createdAt - a.notification.createdAt)
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 3e4,
    refetchOnMount: true,
    refetchInterval: 9e4
  });
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      if (!anyActor) return;
      await anyActor.markNotificationRead(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myNotifications"] });
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!anyActor) return;
      await anyActor.deleteMyNotification(id);
    },
    onSuccess: (_data, deletedId) => {
      qc.invalidateQueries({ queryKey: ["myNotifications"] });
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
      if ((selected == null ? void 0 : selected.notification.id) === deletedId) setSelected(null);
    }
  });
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!anyActor) return;
      await anyActor.markAllNotificationsRead();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myNotifications"] });
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
    }
  });
  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-semibold text-foreground", children: "Benachrichtigungen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: unreadCount > 0 ? `${unreadCount} ungelesen` : "Alle gelesen" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8",
            title: "Aktualisieren",
            onClick: () => refetch(),
            disabled: isRefetching,
            "data-ocid": "notifications.refresh_button",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              RefreshCw,
              {
                className: `w-4 h-4 ${isRefetching ? "animate-spin" : ""}`
              }
            )
          }
        ),
        unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            className: "gap-2",
            onClick: () => markAllReadMutation.mutate(),
            disabled: markAllReadMutation.isPending,
            "data-ocid": "notifications.mark_all_read_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCheck, { className: "w-4 h-4" }),
              "Alle gelesen"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex-1 shadow-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Alle Nachrichten" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tabs,
            {
              value: filter,
              onValueChange: (v) => setFilter(v),
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "h-7", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TabsTrigger,
                  {
                    value: "all",
                    className: "text-xs h-6 px-2",
                    "data-ocid": "notifications.filter.all",
                    children: "Alle"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TabsTrigger,
                  {
                    value: "unread",
                    className: "text-xs h-6 px-2",
                    "data-ocid": "notifications.filter.unread",
                    children: "Ungelesen"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TabsTrigger,
                  {
                    value: "read",
                    className: "text-xs h-6 px-2",
                    "data-ocid": "notifications.filter.read",
                    children: "Gelesen"
                  }
                )
              ] })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" })
        ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground",
            "data-ocid": "notifications.empty_state",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-8 h-8 opacity-40" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Keine Benachrichtigungen" })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: filtered.map((n, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: (selected == null ? void 0 : selected.notification.id) === n.notification.id ? "ring-1 ring-primary/30 bg-primary/5" : "",
            "data-ocid": `notifications.item.${idx + 1}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              NotificationItem,
              {
                notification: n,
                onRead: (id) => markReadMutation.mutate(id),
                onDelete: (id) => deleteMutation.mutate(id),
                onClick: (notif) => {
                  setSelected(notif);
                  if (!notif.isRead)
                    markReadMutation.mutate(notif.notification.id);
                }
              }
            )
          },
          n.notification.id
        )) }) })
      ] }),
      selected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:w-96", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        NotificationDetail,
        {
          notification: selected,
          onBack: () => setSelected(null),
          onDelete: (id) => deleteMutation.mutate(id),
          onRead: (id) => markReadMutation.mutate(id)
        }
      ) })
    ] })
  ] }) });
}
export {
  NotificationsPage as default
};
