import { e as useQueryClient, r as reactExports, j as jsxRuntimeExports, S as Skeleton, c as cn, a as useNavigate, b as useSearch } from "./index-D_yjRFGt.js";
import { q as useMutation, D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, j as Checkbox, k as DialogFooter, B as Building2, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, s as Root, W as WarningProvider, v as Content, w as Title, x as Description, y as Close, z as createDialogScope, P as Portal, O as Overlay, A as Trigger, n as normalizeTimeInput, V as Variant_gutschrift_reduktion, E as ChevronUp, F as Erfassungsart, G as Separator, L as Layout } from "./Layout-BOoVnXJI.js";
import { d as useAuth, u as useActor, b as useQuery, c as createActor } from "./useAuthStore-RPelH0kd.js";
import { D as DeleteConfirmDialog } from "./DeleteConfirmDialog-CO-H5i0R.js";
import { B as Badge } from "./badge-BPk2SywW.js";
import { B as Button, b as buttonVariants } from "./button-BXNzWYpr.js";
import { u as ue, L as Label, I as Input } from "./index-SoMYIp0N.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CXihOV-A.js";
import { P as Plus } from "./plus-1FdrTAyc.js";
import { P as Pencil } from "./pencil-BbiFCrI_.js";
import { T as Trash2 } from "./trash-2-DpHAoxHy.js";
import { L as Lock } from "./lock-BD6_Ipmh.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-Cqx-QXhC.js";
import { c as createLucideIcon } from "./createLucideIcon-C599ATMm.js";
import { G as Globe, c as composeEventHandlers, m as createSlottable, d as createContextScope, k as Clock, C as ChevronDown, i as Check, F as FileText, X } from "./x-BHvIGru9.js";
import { S as Switch } from "./switch-CWyjrepr.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BXMAOymm.js";
import { T as Textarea } from "./textarea-DOcRjrEq.js";
import { u as useActor$1, t as timestampToDate, h as hhmmToMinutes, d as dateToTimestamp, b as bigintToHhMm, a as hhhmmToMinutes, c as minutesToHhhMm, p as parseVacationDays, f as formatVacationDays, g as getRoleLabel } from "./shared-CwBSRdlg.js";
import { A as ArrowLeft } from "./arrow-left-DwEQQdCE.js";
import { S as Save } from "./save-Cu4HicBy.js";
import { C as CreditCard } from "./credit-card-b8XaB1XZ.js";
import { T as TrendingDown } from "./trending-down-CXXeeFjY.js";
import { T as TriangleAlert } from "./triangle-alert-B5iOPlZp.js";
import { E as ExternalLink } from "./external-link-DFTsr6fS.js";
import { C as CircleAlert } from "./circle-alert-DtnCEIpe.js";
import { c as checkPlanChange, a as checkDowngradeNeeded } from "./planUtils-CmuewgAl.js";
import { n as nanosToLocalIsoDate, g as getActiveEmploymentForDate } from "./employmentUtils-C-5ZbofZ.js";
import { u as useComposedRefs } from "./index-HGa3Ynxo.js";
import { f as formatDateDE$1 } from "./dateFormat-CjU5zGrG.js";
import { C as Copy } from "./copy-DIiJ_VvE.js";
import { I as Info } from "./info-C6QjoeIM.js";
import { I as Image } from "./image-C45ozPsA.js";
import "./loader-circle-DPIlcj_m.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$9 = [
  ["path", { d: "M17 12H7", key: "16if0g" }],
  ["path", { d: "M19 18H5", key: "18s9l3" }],
  ["path", { d: "M21 6H3", key: "1jwq7v" }]
];
const AlignCenter = createLucideIcon("align-center", __iconNode$9);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$8 = [
  ["path", { d: "M15 12H3", key: "6jk70r" }],
  ["path", { d: "M17 18H3", key: "1amg6g" }],
  ["path", { d: "M21 6H3", key: "1jwq7v" }]
];
const AlignLeft = createLucideIcon("align-left", __iconNode$8);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$7 = [
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M21 18H7", key: "1ygte8" }],
  ["path", { d: "M21 6H3", key: "1jwq7v" }]
];
const AlignRight = createLucideIcon("align-right", __iconNode$7);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode$6);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
];
const Layers = createLucideIcon("layers", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
];
const Link2 = createLucideIcon("link-2", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["rect", { width: "5", height: "5", x: "3", y: "3", rx: "1", key: "1tu5fj" }],
  ["rect", { width: "5", height: "5", x: "16", y: "3", rx: "1", key: "1v8r4q" }],
  ["rect", { width: "5", height: "5", x: "3", y: "16", rx: "1", key: "1x03jg" }],
  ["path", { d: "M21 16h-3a2 2 0 0 0-2 2v3", key: "177gqh" }],
  ["path", { d: "M21 21v.01", key: "ents32" }],
  ["path", { d: "M12 7v3a2 2 0 0 1-2 2H7", key: "8crl2c" }],
  ["path", { d: "M3 12h.01", key: "nlz23k" }],
  ["path", { d: "M12 3h.01", key: "n36tog" }],
  ["path", { d: "M12 16v.01", key: "133mhm" }],
  ["path", { d: "M16 12h1", key: "1slzba" }],
  ["path", { d: "M21 12v.01", key: "1lwtk9" }],
  ["path", { d: "M12 21v-1", key: "1880an" }]
];
const QrCode = createLucideIcon("qr-code", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M11.5 15H7a4 4 0 0 0-4 4v2", key: "15lzij" }],
  [
    "path",
    {
      d: "M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",
      key: "1817ys"
    }
  ],
  ["circle", { cx: "10", cy: "7", r: "4", key: "e45bow" }]
];
const UserPen = createLucideIcon("user-pen", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
const toAny$2 = (a) => a;
const defaultForm$8 = {
  name: "",
  requiresApproval: false,
  compensated: false,
  aktiv: true,
  visibleInCompanyCalendar: true,
  visibilityMode: "masked_reason",
  visibleForRoles: "all",
  companyCalendarDisplayName: "",
  companyCalendarColor: ""
};
function isSystemFerien(at) {
  return at.name.toLowerCase() === "ferien";
}
function AbsenceTypenTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm$8);
  const [nameError, setNameError] = reactExports.useState("");
  const isEditingFerien = editItem !== null && isSystemFerien(editItem);
  const { data: absenceTypes = [], isLoading } = useQuery({
    queryKey: ["absenceTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny$2(actor).listAbsenceTypes();
    },
    enabled: !!actor && !isFetching
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      if (editItem) {
        const visibilityPayload = {
          visibleInCompanyCalendar: form.visibleInCompanyCalendar,
          visibilityMode: form.visibilityMode,
          visibleForRoles: [form.visibleForRoles],
          companyCalendarDisplayName: form.companyCalendarDisplayName || void 0,
          companyCalendarColor: form.companyCalendarColor || void 0,
          showEmployeeName: true,
          showAbsenceTypeName: form.visibilityMode === "full",
          showComment: false
        };
        const updatePayload = isEditingFerien ? {
          name: editItem.name,
          // keep locked
          requiresApproval: editItem.requiresApproval,
          // keep locked (system Ferien value)
          compensated: editItem.compensated,
          // keep locked
          aktiv: editItem.aktiv,
          // keep locked
          visibility: visibilityPayload
        } : {
          name: form.name,
          requiresApproval: form.requiresApproval,
          compensated: form.compensated,
          aktiv: form.aktiv,
          visibility: visibilityPayload
        };
        const res2 = await toAny$2(actor).updateAbsenceType(
          editItem.id,
          updatePayload
        );
        if (res2.__kind__ === "err") throw new Error(res2.err ?? "Fehler");
        return res2.ok;
      }
      const createVisibility = {
        visibleInCompanyCalendar: form.visibleInCompanyCalendar,
        visibilityMode: form.visibilityMode,
        visibleForRoles: [form.visibleForRoles],
        companyCalendarDisplayName: form.companyCalendarDisplayName || void 0,
        companyCalendarColor: form.companyCalendarColor || void 0,
        showEmployeeName: true,
        showAbsenceTypeName: form.visibilityMode === "full",
        showComment: false
      };
      const res = await toAny$2(actor).createAbsenceType({
        name: form.name,
        requiresApproval: form.requiresApproval,
        compensated: form.compensated,
        aktiv: form.aktiv,
        visibility: createVisibility
      });
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["absenceTypes"] });
      ue.success(
        editItem ? "Abwesenheitsart aktualisiert" : "Abwesenheitsart erstellt"
      );
      setDialogOpen(false);
    },
    onError: (e) => ue.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await toAny$2(actor).deleteAbsenceType(id);
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["absenceTypes"] });
      ue.success("Abwesenheitsart gelöscht");
      setDeleteTarget(null);
    },
    onError: (e) => ue.error(e.message)
  });
  function openAdd() {
    setEditItem(null);
    setForm(defaultForm$8);
    setNameError("");
    setDialogOpen(true);
  }
  function openEdit(at) {
    var _a, _b, _c, _d, _e, _f;
    setEditItem(at);
    setForm({
      name: at.name,
      requiresApproval: at.requiresApproval,
      compensated: at.compensated,
      aktiv: at.aktiv,
      visibleInCompanyCalendar: ((_a = at.visibility) == null ? void 0 : _a.visibleInCompanyCalendar) ?? true,
      visibilityMode: ((_b = at.visibility) == null ? void 0 : _b.visibilityMode) ?? "masked_reason",
      visibleForRoles: ((_d = (_c = at.visibility) == null ? void 0 : _c.visibleForRoles) == null ? void 0 : _d[0]) ?? "all",
      companyCalendarDisplayName: ((_e = at.visibility) == null ? void 0 : _e.companyCalendarDisplayName) ?? "",
      companyCalendarColor: ((_f = at.visibility) == null ? void 0 : _f.companyCalendarColor) ?? ""
    });
    setNameError("");
    setDialogOpen(true);
  }
  function handleSubmit() {
    if (!form.name.trim() && !isEditingFerien) {
      setNameError("Pflichtfeld");
      return;
    }
    setNameError("");
    saveMutation.mutate();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        absenceTypes.length,
        " Abwesenheitsarten"
      ] }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "abwesenheitsarten-add",
          onClick: openAdd,
          size: "sm",
          className: "gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Abwesenheitsart hinzufügen"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Entschädigt (Arbeitszeit)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: absenceTypes.filter((at) => !isSystemFerien(at)).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: canWrite ? 4 : 3,
          className: "text-center py-8 text-muted-foreground",
          children: "Keine Abwesenheitsarten vorhanden"
        }
      ) }) : absenceTypes.filter((at) => !isSystemFerien(at)).map((at) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          "data-ocid": "abwesenheitsarten-row",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: at.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: at.compensated ? "Ja" : "Nein" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: at.aktiv ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100", children: "Aktiv" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Inaktiv" }) }),
            canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8",
                  onClick: () => openEdit(at),
                  "aria-label": "Bearbeiten",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8 text-destructive hover:text-destructive",
                  onClick: () => setDeleteTarget(at),
                  "aria-label": "Löschen",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] }) })
          ]
        },
        String(at.id)
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Abwesenheitsart bearbeiten" : "Abwesenheitsart hinzufügen" }) }),
      isEditingFerien && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4 text-primary mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs leading-relaxed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Systemverwaltet:" }),
          " ",
          "Für die Abwesenheitsart ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "Ferien" }),
          " kann nur",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Genehmigung erforderlich" }),
          " bearbeitet werden."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "atname", children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "atname",
              "data-ocid": "abwesenheitsarten-name",
              value: form.name,
              onChange: (e) => setForm({ ...form, name: e.target.value }),
              disabled: isEditingFerien,
              className: isEditingFerien ? "opacity-60 cursor-not-allowed" : ""
            }
          ),
          nameError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: nameError })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "atcompensated",
              "data-ocid": "abwesenheitsarten-compensated",
              checked: form.compensated,
              onCheckedChange: isEditingFerien ? void 0 : (v) => setForm({ ...form, compensated: !!v }),
              disabled: isEditingFerien,
              className: isEditingFerien ? "opacity-60 cursor-not-allowed" : ""
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Label,
            {
              htmlFor: "atcompensated",
              className: isEditingFerien ? "opacity-60" : "",
              children: [
                "Entschädigt (Arbeitszeit)",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs font-normal text-muted-foreground mt-0.5", children: "Abwesenheit zählt als Arbeitszeit" })
              ]
            }
          )
        ] }),
        !isEditingFerien && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "atrequiresapproval",
              "data-ocid": "abwesenheitsarten-requires-approval",
              checked: form.requiresApproval,
              onCheckedChange: (v) => setForm({ ...form, requiresApproval: !!v })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "atrequiresapproval", children: [
            "Genehmigung erforderlich",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs font-normal text-muted-foreground mt-0.5", children: "Erfassung löst Genehmigungsworkflow aus" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "ataktiv",
              "data-ocid": "abwesenheitsarten-aktiv",
              checked: form.aktiv,
              onCheckedChange: isEditingFerien ? void 0 : (v) => setForm({ ...form, aktiv: !!v }),
              disabled: isEditingFerien,
              className: isEditingFerien ? "opacity-60 cursor-not-allowed" : ""
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Label,
            {
              htmlFor: "ataktiv",
              className: isEditingFerien ? "opacity-60" : "",
              children: [
                "Aktiv",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs font-normal text-muted-foreground mt-0.5", children: "Inaktive Abwesenheitsarten werden bei der Erfassung nicht angezeigt" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: {
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--border)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: 13, marginBottom: 8 }, children: "Firmenkalender Sichtbarkeit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                htmlFor: "visibility-company-calendar-checkbox",
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  fontSize: 13
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "visibility-company-calendar-checkbox",
                      type: "checkbox",
                      checked: form.visibleInCompanyCalendar,
                      onChange: (e) => setForm((f) => ({
                        ...f,
                        visibleInCompanyCalendar: e.target.checked
                      }))
                    }
                  ),
                  "Im Firmenkalender sichtbar"
                ]
              }
            ),
            form.visibleInCompanyCalendar && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "label",
                  {
                    htmlFor: "visibility-mode-select",
                    style: { fontSize: 12, display: "block", marginBottom: 2 },
                    className: "text-muted-foreground",
                    children: "Sichtbarkeitsmodus"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    id: "visibility-mode-select",
                    value: form.visibilityMode,
                    onChange: (e) => setForm((f) => ({ ...f, visibilityMode: e.target.value })),
                    style: {
                      width: "100%",
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: "1px solid var(--border)",
                      fontSize: 13,
                      background: "var(--background)",
                      color: "var(--foreground)"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "full", children: "Vollständig sichtbar (Name + Grund)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "masked_reason", children: "Zeitraum sichtbar (Nicht verfügbar)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "anonymized", children: "Anonymisiert (Abwesenheit)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hidden", children: "Nicht sichtbar" })
                    ]
                  }
                )
              ] }),
              form.visibilityMode !== "hidden" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: "visibility-roles-select",
                      style: {
                        fontSize: 12,
                        display: "block",
                        marginBottom: 2
                      },
                      className: "text-muted-foreground",
                      children: "Sichtbar für"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "select",
                    {
                      id: "visibility-roles-select",
                      value: form.visibleForRoles,
                      onChange: (e) => setForm((f) => ({
                        ...f,
                        visibleForRoles: e.target.value
                      })),
                      style: {
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid var(--border)",
                        fontSize: 13,
                        background: "var(--background)",
                        color: "var(--foreground)"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "Alle Mitarbeitenden" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin_manager", children: "Nur Admins und Manager" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: "visibility-display-name-input",
                      style: {
                        fontSize: 12,
                        display: "block",
                        marginBottom: 2
                      },
                      className: "text-muted-foreground",
                      children: "Anzeigename im Firmenkalender (optional)"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "visibility-display-name-input",
                      type: "text",
                      value: form.companyCalendarDisplayName,
                      onChange: (e) => setForm((f) => ({
                        ...f,
                        companyCalendarDisplayName: e.target.value
                      })),
                      placeholder: "z.B. Nicht verfügbar",
                      style: {
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid var(--border)",
                        fontSize: 13,
                        background: "var(--background)",
                        color: "var(--foreground)"
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "label",
                    {
                      htmlFor: "visibility-color-input",
                      style: {
                        fontSize: 12,
                        display: "block",
                        marginBottom: 2
                      },
                      className: "text-muted-foreground",
                      children: "Farbe im Firmenkalender (z.B. #9ca3af)"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      id: "visibility-color-input",
                      type: "text",
                      value: form.companyCalendarColor,
                      onChange: (e) => setForm((f) => ({
                        ...f,
                        companyCalendarColor: e.target.value
                      })),
                      placeholder: "#9ca3af",
                      style: {
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid var(--border)",
                        fontSize: 13,
                        background: "var(--background)",
                        color: "var(--foreground)"
                      }
                    }
                  )
                ] })
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDialogOpen(false),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": "abwesenheitsarten-save",
            onClick: handleSubmit,
            disabled: saveMutation.isPending,
            children: saveMutation.isPending ? "Speichern..." : "Speichern"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: !!deleteTarget,
        onConfirm: () => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        },
        onCancel: () => setDeleteTarget(null),
        isDeleting: deleteMutation.isPending
      }
    )
  ] });
}
function formatDateDE(dateStr) {
  if (!dateStr) return "–";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}
const defaultForm$7 = {
  name: "",
  date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
  ganztaegig: true
};
function FeiertageTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm$7);
  const [errors, setErrors] = reactExports.useState({});
  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ["holidays"],
    queryFn: () => (actor == null ? void 0 : actor.listHolidays()) ?? [],
    enabled: !!actor && !isFetching
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const rawActor = Object.assign(
        {},
        actor
      ).actor;
      const ganztaegigCandid = [form.ganztaegig];
      if (editItem) {
        const res2 = await rawActor.updateHoliday(editItem.id, {
          name: [form.name],
          date: [form.date],
          ganztaegig: ganztaegigCandid
        });
        if (res2.__kind__ === "err") throw new Error(res2.err);
        return res2.ok;
      }
      const res = await rawActor.createHoliday({
        name: form.name,
        date: form.date,
        ganztaegig: ganztaegigCandid
      });
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
      ue.success(editItem ? "Feiertag aktualisiert" : "Feiertag erstellt");
      setDialogOpen(false);
    },
    onError: (e) => ue.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteHoliday(id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
      ue.success("Feiertag gelöscht");
      setDeleteTarget(null);
    },
    onError: (e) => ue.error(e.message)
  });
  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Pflichtfeld";
    if (!form.date) errs.date = "Pflichtfeld";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }
  function openAdd() {
    setEditItem(null);
    setForm(defaultForm$7);
    setErrors({});
    setDialogOpen(true);
  }
  function openEdit(h) {
    setEditItem(h);
    setForm({ name: h.name, date: h.date, ganztaegig: h.ganztaegig });
    setErrors({});
    setDialogOpen(true);
  }
  const sortedHolidays = [...holidays].sort(
    (a, b) => a.date.localeCompare(b.date)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        holidays.length,
        " Feiertage"
      ] }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "feiertage-add",
          onClick: openAdd,
          size: "sm",
          className: "gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Feiertag hinzufügen"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Art" }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sortedHolidays.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: canWrite ? 4 : 3,
          className: "text-center py-8 text-muted-foreground",
          children: "Keine Feiertage vorhanden"
        }
      ) }) : sortedHolidays.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { "data-ocid": "feiertage-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: h.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-sm", children: formatDateDE(h.date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: h.ganztaegig ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100", children: "Ganztägig" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Halbtägig" }) }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8",
              onClick: () => openEdit(h),
              "aria-label": "Bearbeiten",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 text-destructive hover:text-destructive",
              onClick: () => setDeleteTarget(h),
              "aria-label": "Löschen",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }) })
      ] }, String(h.id))) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Feiertag bearbeiten" : "Feiertag hinzufügen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "hname", children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "hname",
              "data-ocid": "feiertage-name",
              value: form.name,
              onChange: (e) => setForm({ ...form, name: e.target.value })
            }
          ),
          errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "hdate", children: "Datum *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "hdate",
              type: "date",
              "data-ocid": "feiertage-date",
              value: form.date,
              onChange: (e) => setForm({ ...form, date: e.target.value })
            }
          ),
          errors.date && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.date })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Art des Feiertags" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "radio",
                  name: "feiertag-art",
                  value: "ganztaegig",
                  checked: form.ganztaegig,
                  onChange: () => setForm({ ...form, ganztaegig: true }),
                  className: "accent-primary",
                  "data-ocid": "feiertage-ganztaegig"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Ganztägig" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "radio",
                  name: "feiertag-art",
                  value: "halbtaegig",
                  checked: !form.ganztaegig,
                  onChange: () => setForm({ ...form, ganztaegig: false }),
                  className: "accent-primary",
                  "data-ocid": "feiertage-halbtaegig"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Halbtägig" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Steuert die Anzahl Stunden gemäss Pensum und Feiertagsberechnungsart der Beschäftigung." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDialogOpen(false),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": "feiertage-save",
            onClick: () => {
              if (validate()) saveMutation.mutate();
            },
            disabled: saveMutation.isPending,
            children: saveMutation.isPending ? "Speichern..." : "Speichern"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteTarget, onOpenChange: () => setDeleteTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Feiertag löschen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Möchten Sie ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget == null ? void 0 : deleteTarget.name }),
        " wirklich löschen?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDeleteTarget(null),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "destructive",
            "data-ocid": "feiertage-delete-confirm",
            onClick: () => deleteTarget && deleteMutation.mutate(deleteTarget.id),
            disabled: deleteMutation.isPending,
            children: "Löschen"
          }
        )
      ] })
    ] }) })
  ] });
}
const toAny$1 = (a) => a;
const TIMEZONE_OPTIONS = [
  { value: "Europe/Zurich", label: "Europa/Zürich (CET/CEST)" },
  { value: "Europe/Berlin", label: "Europa/Berlin (CET/CEST)" },
  { value: "Europe/London", label: "Europa/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europa/Paris (CET/CEST)" },
  { value: "UTC", label: "UTC (Koordinierte Weltzeit)" },
  { value: "America/New_York", label: "Amerika/New York (EST/EDT)" }
];
function FirmaTab() {
  const { role, setCompanyLogo } = useAuth();
  const canWrite = role === "admin";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const fileInputRef = reactExports.useRef(null);
  const [form, setForm] = reactExports.useState({
    name: "",
    taxId: "",
    address: "",
    logoUrl: ""
  });
  const [nameError, setNameError] = reactExports.useState("");
  const [logoPreview, setLogoPreview] = reactExports.useState(null);
  const [timezone, setTimezone] = reactExports.useState("Europe/Zurich");
  const { data: company, isLoading } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const res = await toAny$1(actor).getMyCompany();
        const r = res;
        if (r.__kind__ === "err") return null;
        return r.ok ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching
  });
  const { data: companySettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["companySettings"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const res = await toAny$1(actor).getCompanySettings();
        const r = res;
        return r.__kind__ === "ok" ? r.ok ?? null : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching
  });
  reactExports.useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        taxId: company.taxId ?? "",
        address: company.address ?? "",
        logoUrl: company.logoUrl ?? ""
      });
      if (company.logoUrl) setLogoPreview(company.logoUrl);
    }
  }, [company]);
  reactExports.useEffect(() => {
    if (companySettings == null ? void 0 : companySettings.timezone) {
      setTimezone(companySettings.timezone);
    }
  }, [companySettings]);
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const res = await toAny$1(actor).updateCompany({
        name: form.name || void 0,
        taxId: form.taxId || void 0,
        address: form.address || void 0,
        logoUrl: form.logoUrl || void 0
      });
      const r = res;
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
      if (companySettings) {
        const settingsRes = await toAny$1(actor).updateCompanySettings({
          ...companySettings,
          timezone
        });
        const sr = settingsRes;
        if (sr.__kind__ === "err")
          throw new Error(sr.err ?? "Fehler beim Speichern der Zeitzone");
      }
      return r.ok;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["company"] });
      qc.invalidateQueries({ queryKey: ["companySettings"] });
      const updatedCompany = updated;
      if (updatedCompany == null ? void 0 : updatedCompany.logoUrl) {
        setCompanyLogo(updatedCompany.logoUrl);
      }
      ue.success("Firmendaten gespeichert");
    },
    onError: (e) => ue.error(e.message)
  });
  function handleLogoChange(e) {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      var _a2;
      const url = (_a2 = ev.target) == null ? void 0 : _a2.result;
      setLogoPreview(url);
      setForm((prev) => ({ ...prev, logoUrl: url }));
    };
    reader.readAsDataURL(file);
  }
  function handleSubmit() {
    if (!form.name.trim()) {
      setNameError("Pflichtfeld");
      return;
    }
    setNameError("");
    saveMutation.mutate();
  }
  if (isLoading || settingsLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-5 h-5 text-primary" }),
        "Firmeninformationen"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Firmenlogo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-16 rounded-lg border border-border bg-muted/30 flex items-center justify-center overflow-hidden", children: logoPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: logoPreview,
                alt: "Firmenlogo",
                className: "max-w-full max-h-full object-contain"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-8 h-8 text-muted-foreground" }) }),
            canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  size: "sm",
                  className: "gap-2",
                  "data-ocid": "firma-logo-upload",
                  onClick: () => {
                    var _a;
                    return (_a = fileInputRef.current) == null ? void 0 : _a.click();
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" }),
                    "Logo hochladen"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: fileInputRef,
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: handleLogoChange,
                  "aria-label": "Logo hochladen"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "JPG, PNG oder SVG, max. 2 MB. Wird sofort im Header angezeigt." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fname", children: "Firmenname *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "fname",
              "data-ocid": "firma-name",
              value: form.name,
              onChange: (e) => setForm({ ...form, name: e.target.value }),
              disabled: !canWrite
            }
          ),
          nameError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: nameError })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ftaxid", children: "Steuer-ID / MWST-Nummer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "ftaxid",
              "data-ocid": "firma-taxid",
              value: form.taxId,
              onChange: (e) => setForm({ ...form, taxId: e.target.value }),
              disabled: !canWrite,
              placeholder: "CHE-123.456.789 MWST"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "faddress", children: "Adresse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "faddress",
              "data-ocid": "firma-address",
              value: form.address,
              onChange: (e) => setForm({ ...form, address: e.target.value }),
              disabled: !canWrite,
              placeholder: "Musterstrasse 1, 8001 Zürich"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-5 h-5 text-primary" }),
        "Zeitzone"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ftz", children: "Firmen-Zeitzone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: timezone,
            onValueChange: setTimezone,
            disabled: !canWrite,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "ftz", "data-ocid": "firma-timezone", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Zeitzone wählen" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIMEZONE_OPTIONS.map((tz) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: tz.value, children: tz.label }, tz.value)) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Die Zeitzone wird für alle Datumsanzeigen verwendet (Dashboard, Kalender, Zeiterfassung)." })
      ] }) })
    ] }),
    canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "button",
        "data-ocid": "firma-save",
        onClick: handleSubmit,
        disabled: saveMutation.isPending,
        className: "min-w-[160px]",
        children: saveMutation.isPending ? "Speichern..." : "Änderungen speichern"
      }
    ) }),
    !canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nur Administratoren können Firmendaten bearbeiten." })
  ] });
}
const defaultForm$6 = {
  name: "",
  beschreibung: "",
  kundennummer: "",
  ra_zusatz1: "",
  ra_zusatz2: "",
  ra_strasse: "",
  ra_postfach: "",
  ra_plz: "",
  ra_ort: "",
  ra_land: "Schweiz",
  waehrung: "CHF",
  aktiv: true
};
function customerToForm(c) {
  var _a, _b, _c, _d, _e, _f, _g;
  return {
    name: c.name,
    beschreibung: c.beschreibung ?? "",
    kundennummer: c.kundennummer ?? "",
    ra_zusatz1: ((_a = c.rechnungsadresse) == null ? void 0 : _a.zusatz1) ?? "",
    ra_zusatz2: ((_b = c.rechnungsadresse) == null ? void 0 : _b.zusatz2) ?? "",
    ra_strasse: ((_c = c.rechnungsadresse) == null ? void 0 : _c.strasse) ?? "",
    ra_postfach: ((_d = c.rechnungsadresse) == null ? void 0 : _d.postfach) ?? "",
    ra_plz: ((_e = c.rechnungsadresse) == null ? void 0 : _e.plz) ?? "",
    ra_ort: ((_f = c.rechnungsadresse) == null ? void 0 : _f.ort) ?? "",
    ra_land: ((_g = c.rechnungsadresse) == null ? void 0 : _g.land) ?? "Schweiz",
    waehrung: c.waehrung ?? "CHF",
    aktiv: c.aktiv
  };
}
function KundenTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor$1();
  const qc = useQueryClient();
  const [view, setView] = reactExports.useState("list");
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm$6);
  const [nameError, setNameError] = reactExports.useState("");
  const [activeTab, setActiveTab] = reactExports.useState("kunde");
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => (actor == null ? void 0 : actor.listCustomers()) ?? Promise.resolve([]),
    enabled: !!actor && !isFetching
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const rechnungsadresse = {
        zusatz1: form.ra_zusatz1 || void 0,
        zusatz2: form.ra_zusatz2 || void 0,
        strasse: form.ra_strasse || void 0,
        postfach: form.ra_postfach || void 0,
        plz: form.ra_plz || void 0,
        ort: form.ra_ort || void 0,
        land: form.ra_land || "Schweiz"
      };
      const input = {
        name: form.name,
        beschreibung: form.beschreibung || void 0,
        kundennummer: form.kundennummer || void 0,
        rechnungsadresse,
        waehrung: form.waehrung || "CHF",
        aktiv: form.aktiv,
        contact: void 0,
        notes: void 0
      };
      if (editItem) {
        const res2 = await actor.updateCustomer(editItem.id, input);
        if (res2.__kind__ === "err") throw new Error(res2.err);
        return res2.ok;
      }
      const res = await actor.createCustomer(input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      ue.success(editItem ? "Kunde aktualisiert" : "Kunde erstellt");
      setView("list");
    },
    onError: (e) => ue.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteCustomer(id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      ue.success("Kunde gelöscht");
      setDeleteTarget(null);
    },
    onError: (e) => ue.error(e.message)
  });
  function openAdd() {
    setEditItem(null);
    setForm(defaultForm$6);
    setNameError("");
    setActiveTab("kunde");
    setView("edit");
  }
  function openEdit(c) {
    setEditItem(c);
    setForm(customerToForm(c));
    setNameError("");
    setActiveTab("kunde");
    setView("edit");
  }
  function handleSave() {
    if (!form.name.trim()) {
      setNameError("Pflichtfeld");
      setActiveTab("kunde");
      return;
    }
    setNameError("");
    saveMutation.mutate();
  }
  function sf(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  if (view === "list") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          customers.length,
          " Kunden"
        ] }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            "data-ocid": "kunden-add",
            onClick: openAdd,
            size: "sm",
            className: "gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
              "Kunden hinzufügen"
            ]
          }
        )
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Kundennummer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: customers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableCell,
          {
            colSpan: canWrite ? 4 : 3,
            className: "text-center py-8 text-muted-foreground",
            children: "Keine Kunden vorhanden"
          }
        ) }) : customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            "data-ocid": "kunden-row",
            className: !c.aktiv ? "opacity-50" : "",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: c.kundennummer ?? "–" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: c.aktiv ? "default" : "secondary", children: c.aktiv ? "Aktiv" : "Inaktiv" }) }),
              canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8",
                    onClick: () => openEdit(c),
                    "aria-label": "Bearbeiten",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8 text-destructive hover:text-destructive",
                    onClick: () => setDeleteTarget(c),
                    "aria-label": "Löschen",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] }) })
            ]
          },
          String(c.id)
        )) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Dialog,
        {
          open: !!deleteTarget,
          onOpenChange: () => setDeleteTarget(null),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Kunde löschen" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "Möchten Sie ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget == null ? void 0 : deleteTarget.name }),
              " wirklich löschen?"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  onClick: () => setDeleteTarget(null),
                  children: "Abbrechen"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "destructive",
                  "data-ocid": "kunden-delete-confirm",
                  onClick: () => deleteTarget && deleteMutation.mutate(deleteTarget.id),
                  disabled: deleteMutation.isPending,
                  children: "Löschen"
                }
              )
            ] })
          ] })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => setView("list"),
          className: "gap-2 text-muted-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Zurück"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold truncate", children: editItem ? editItem.name : "Neuer Kunde" }),
        editItem && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: editItem.aktiv ? "default" : "secondary", children: editItem.aktiv ? "Aktiv" : "Inaktiv" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap h-auto gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "kunde", "data-ocid": "tab-kunde", children: "Kunde" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "rechnungsadresse",
            "data-ocid": "tab-rechnungsadresse",
            children: "Rechnungsadresse"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "einstellungen", "data-ocid": "tab-einstellungen", children: "Kundeneinstellungen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "status", "data-ocid": "tab-status", children: "Status" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "kunde", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k-name", children: "Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "k-name",
                "data-ocid": "kunden-name",
                value: form.name,
                onChange: (e) => sf("name", e.target.value),
                disabled: !canWrite,
                className: nameError ? "border-destructive" : ""
              }
            ),
            nameError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: nameError })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k-kundennummer", children: "Kundennummer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "k-kundennummer",
                "data-ocid": "kunden-kundennummer",
                value: form.kundennummer,
                onChange: (e) => sf("kundennummer", e.target.value),
                disabled: !canWrite,
                placeholder: "Optional"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "k-beschreibung", children: "Beschreibung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "k-beschreibung",
              "data-ocid": "kunden-beschreibung",
              value: form.beschreibung,
              onChange: (e) => sf("beschreibung", e.target.value),
              disabled: !canWrite,
              rows: 3,
              placeholder: "Optional"
            }
          )
        ] }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleSave,
            disabled: saveMutation.isPending,
            className: "gap-2",
            "data-ocid": "kunden-save",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              saveMutation.isPending ? "Speichern..." : "Speichern"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "rechnungsadresse", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ra-zusatz1", children: "Zusatz 1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "ra-zusatz1",
                "data-ocid": "kunden-ra-zusatz1",
                value: form.ra_zusatz1,
                onChange: (e) => sf("ra_zusatz1", e.target.value),
                disabled: !canWrite,
                placeholder: "Optional"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ra-zusatz2", children: "Zusatz 2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "ra-zusatz2",
                "data-ocid": "kunden-ra-zusatz2",
                value: form.ra_zusatz2,
                onChange: (e) => sf("ra_zusatz2", e.target.value),
                disabled: !canWrite,
                placeholder: "Optional"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ra-strasse", children: "Strasse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "ra-strasse",
                "data-ocid": "kunden-ra-strasse",
                value: form.ra_strasse,
                onChange: (e) => sf("ra_strasse", e.target.value),
                disabled: !canWrite
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ra-postfach", children: "Postfach" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "ra-postfach",
                "data-ocid": "kunden-ra-postfach",
                value: form.ra_postfach,
                onChange: (e) => sf("ra_postfach", e.target.value),
                disabled: !canWrite,
                placeholder: "Optional"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ra-plz", children: "PLZ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "ra-plz",
                "data-ocid": "kunden-ra-plz",
                value: form.ra_plz,
                onChange: (e) => sf("ra_plz", e.target.value),
                disabled: !canWrite
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ra-ort", children: "Ort" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "ra-ort",
                "data-ocid": "kunden-ra-ort",
                value: form.ra_ort,
                onChange: (e) => sf("ra_ort", e.target.value),
                disabled: !canWrite
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ra-land", children: "Land" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "ra-land",
                "data-ocid": "kunden-ra-land",
                value: form.ra_land,
                onChange: (e) => sf("ra_land", e.target.value),
                disabled: !canWrite
              }
            )
          ] })
        ] }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleSave,
            disabled: saveMutation.isPending,
            className: "gap-2",
            "data-ocid": "kunden-save-ra",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              saveMutation.isPending ? "Speichern..." : "Speichern"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "einstellungen", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ke-waehrung", children: "Währung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "ke-waehrung",
              "data-ocid": "kunden-waehrung",
              value: form.waehrung,
              onChange: (e) => sf("waehrung", e.target.value),
              disabled: !canWrite,
              placeholder: "CHF"
            }
          )
        ] }) }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleSave,
            disabled: saveMutation.isPending,
            className: "gap-2",
            "data-ocid": "kunden-save-einst",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              saveMutation.isPending ? "Speichern..." : "Speichern"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "status", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border p-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Kundenstatus" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: form.aktiv ? "Aktiv" : "Inaktiv" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: form.aktiv ? "Der Kunde ist aktiv und wird in der Zeiterfassung angezeigt." : "Der Kunde ist inaktiv und wird in der Zeiterfassung ausgeblendet." })
          ] }),
          canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: form.aktiv,
              onCheckedChange: (checked) => sf("aktiv", checked),
              "data-ocid": "kunden-status-toggle"
            }
          )
        ] }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleSave,
            disabled: saveMutation.isPending,
            className: "gap-2",
            "data-ocid": "kunden-save-status",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              saveMutation.isPending ? "Speichern..." : "Speichern"
            ]
          }
        ) })
      ] }) })
    ] })
  ] });
}
const defaultForm$5 = {
  name: "",
  billable: true,
  defaultRate: 0,
  aktiv: true
};
function LeistungsArtenTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm$5);
  const [nameError, setNameError] = reactExports.useState("");
  const { data: serviceTypes = [], isLoading } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: () => (actor == null ? void 0 : actor.listServiceTypes()) ?? [],
    enabled: !!actor && !isFetching
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      if (editItem) {
        const res2 = await actor.updateServiceType(editItem.id, {
          name: form.name,
          billable: form.billable,
          defaultRate: form.defaultRate,
          aktiv: form.aktiv
        });
        if (res2.__kind__ === "err") throw new Error(res2.err);
        return res2.ok;
      }
      const res = await actor.createServiceType({
        name: form.name,
        billable: form.billable,
        defaultRate: form.defaultRate,
        aktiv: form.aktiv
      });
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviceTypes"] });
      ue.success(
        editItem ? "Leistungsart aktualisiert" : "Leistungsart erstellt"
      );
      setDialogOpen(false);
    },
    onError: (e) => ue.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteServiceType(id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviceTypes"] });
      ue.success("Leistungsart gelöscht");
      setDeleteTarget(null);
    },
    onError: (e) => ue.error(e.message)
  });
  function openAdd() {
    setEditItem(null);
    setForm(defaultForm$5);
    setNameError("");
    setDialogOpen(true);
  }
  function openEdit(st) {
    setEditItem(st);
    setForm({
      name: st.name,
      billable: st.billable,
      defaultRate: st.defaultRate,
      aktiv: st.aktiv
    });
    setNameError("");
    setDialogOpen(true);
  }
  function handleSubmit() {
    if (!form.name.trim()) {
      setNameError("Pflichtfeld");
      return;
    }
    setNameError("");
    saveMutation.mutate();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        serviceTypes.length,
        " Leistungsarten"
      ] }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "la-add",
          onClick: openAdd,
          size: "sm",
          className: "gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Leistungsart hinzufügen"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Verrechenbar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Standard-Stundensatz CHF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: serviceTypes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: canWrite ? 5 : 4,
          className: "text-center py-8 text-muted-foreground",
          children: "Keine Leistungsarten vorhanden"
        }
      ) }) : serviceTypes.map((st) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { "data-ocid": "la-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: st.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: st.billable ? "Ja" : "Nein" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: st.defaultRate.toFixed(2) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: st.aktiv ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100", children: "Aktiv" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Inaktiv" }) }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8",
              onClick: () => openEdit(st),
              "aria-label": "Bearbeiten",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 text-destructive hover:text-destructive",
              onClick: () => setDeleteTarget(st),
              "aria-label": "Löschen",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }) })
      ] }, String(st.id))) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Leistungsart bearbeiten" : "Leistungsart hinzufügen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "laname", children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "laname",
              "data-ocid": "la-name",
              value: form.name,
              onChange: (e) => setForm({ ...form, name: e.target.value })
            }
          ),
          nameError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: nameError })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "labile",
              "data-ocid": "la-billable",
              checked: form.billable,
              onCheckedChange: (v) => setForm({ ...form, billable: !!v })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "labile", children: "Verrechenbar" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "larate", children: "Standard-Stundensatz (CHF)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "larate",
              type: "number",
              min: 0,
              step: 0.01,
              "data-ocid": "la-rate",
              value: form.defaultRate,
              onChange: (e) => setForm({ ...form, defaultRate: Number(e.target.value) })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "laaktiv",
              "data-ocid": "la-aktiv",
              checked: form.aktiv,
              onCheckedChange: (v) => setForm({ ...form, aktiv: !!v })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "laaktiv", children: [
            "Aktiv",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs font-normal text-muted-foreground mt-0.5", children: "Inaktive Leistungsarten werden bei der Zeiterfassung nicht angezeigt" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDialogOpen(false),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": "la-save",
            onClick: handleSubmit,
            disabled: saveMutation.isPending,
            children: saveMutation.isPending ? "Speichern..." : "Speichern"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteTarget, onOpenChange: () => setDeleteTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Leistungsart löschen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Möchten Sie ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget == null ? void 0 : deleteTarget.name }),
        " wirklich löschen?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDeleteTarget(null),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "destructive",
            "data-ocid": "la-delete-confirm",
            onClick: () => deleteTarget && deleteMutation.mutate(deleteTarget.id),
            disabled: deleteMutation.isPending,
            children: "Löschen"
          }
        )
      ] })
    ] }) })
  ] });
}
function PlanChangeDialog({
  open,
  info,
  allPlans,
  isLoading,
  confirmLabel,
  onConfirm,
  onCancel,
  stripeCheckoutUrl,
  checkoutError
}) {
  const [billingModel, setBillingModel] = reactExports.useState(
    "monthly"
  );
  reactExports.useEffect(() => {
    if (open) setBillingModel("monthly");
  }, [open]);
  if (!open || !info) return null;
  const newPlan = allPlans.find((p) => p.id === info.suggestedPlanId);
  const userCount = Number(info.activeUserCount);
  const isUpgrade = info.isUpgrade;
  const pricePerMonth = billingModel === "yearly" ? (newPlan == null ? void 0 : newPlan.pricePerYearCHF) ?? 0 : (newPlan == null ? void 0 : newPlan.pricePerMonthCHF) ?? 0;
  const totalCost = billingModel === "yearly" ? userCount * pricePerMonth * 12 : userCount * pricePerMonth;
  const requiresStripePayment = isUpgrade && (newPlan == null ? void 0 : newPlan.requiresPayment) === true && !!((newPlan == null ? void 0 : newPlan.stripePriceId) || (newPlan == null ? void 0 : newPlan.stripePriceIdYearly));
  const titleText = isUpgrade ? "Abo-Wechsel erforderlich" : "Abo-Anpassung möglich";
  const Icon = isUpgrade ? CreditCard : TrendingDown;
  const iconColor = isUpgrade ? "text-amber-600" : "text-blue-600";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (o) => {
        if (!o) onCancel();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { "data-ocid": "plan-change-dialog", className: "max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: `flex items-center gap-2 ${iconColor}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" }),
          titleText
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
          !isUpgrade && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800", children: [
              "Mit ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                userCount,
                " aktiven Mitarbeitenden"
              ] }),
              " wäre ein günstigerer Plan verfügbar."
            ] })
          ] }),
          requiresStripePayment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-800", children: "Dieser Plan erfordert eine Zahlung über Stripe. Nach der Bestätigung wirst du zu Stripe Checkout weitergeleitet." })
          ] }),
          checkoutError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-800", children: checkoutError })
          ] }),
          stripeCheckoutUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-800", children: [
              "Checkout bereit.",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "underline font-medium hover:no-underline",
                  onClick: () => {
                    window.location.href = stripeCheckoutUrl;
                  },
                  children: "Jetzt zu Stripe wechseln"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: info.currentPlanName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: info.suggestedPlanName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: isUpgrade ? `Dein aktueller Plan wird überschritten. Anzahl aktive Mitarbeitende nach Änderung: ${userCount}` : `Anzahl aktive Mitarbeitende nach Änderung: ${userCount}` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Abrechnungsmodell" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "radio",
                    name: "plan-dialog-billingModel",
                    value: "monthly",
                    checked: billingModel === "monthly",
                    onChange: () => setBillingModel("monthly"),
                    className: "accent-primary"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Monatlich" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "radio",
                    name: "plan-dialog-billingModel",
                    value: "yearly",
                    checked: billingModel === "yearly",
                    onChange: () => setBillingModel("yearly"),
                    className: "accent-primary"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Jährlich" })
              ] })
            ] })
          ] }),
          newPlan && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/50 border border-border px-3 py-2.5 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Neue Kosten (geschätzt)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-foreground", children: [
              "CHF",
              " ",
              totalCost.toLocaleString("de-CH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal ml-1", children: billingModel === "yearly" ? `(${userCount} Benutzer × CHF ${pricePerMonth.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/MA/Monat × 12)` : `(${userCount} Benutzer × CHF ${pricePerMonth.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/MA/Monat)` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Monatlich: CHF",
              " ",
              (userCount * (newPlan.pricePerMonthCHF ?? 0)).toLocaleString(
                "de-CH",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              ),
              " | ",
              "Jährlich: CHF",
              " ",
              billingModel === "yearly" ? (userCount * (newPlan.pricePerYearCHF ?? 0) * 12).toLocaleString("de-CH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) : (userCount * (newPlan.pricePerMonthCHF ?? 0) * 12).toLocaleString("de-CH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: onCancel,
              disabled: isLoading,
              "data-ocid": "plan-change-dialog.cancel_button",
              children: isUpgrade ? "Abbrechen" : "Plan beibehalten"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              onClick: () => onConfirm(billingModel),
              disabled: isLoading,
              "data-ocid": "plan-change-dialog.confirm_button",
              className: "gap-1.5",
              children: isLoading && requiresStripePayment ? "Weiterleitung zu Stripe…" : isLoading ? "Wird übernommen…" : requiresStripePayment ? "Bestätigen & zu Stripe" : confirmLabel ?? (isUpgrade ? "Bestätigen & Speichern" : "Plan wechseln")
            }
          )
        ] })
      ] })
    }
  );
}
var ROOT_NAME = "AlertDialog";
var [createAlertDialogContext] = createContextScope(ROOT_NAME, [
  createDialogScope
]);
var useDialogScope = createDialogScope();
var AlertDialog$1 = (props) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ...dialogScope, ...alertDialogProps, modal: true });
};
AlertDialog$1.displayName = ROOT_NAME;
var TRIGGER_NAME = "AlertDialogTrigger";
var AlertDialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { ...dialogScope, ...triggerProps, ref: forwardedRef });
  }
);
AlertDialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "AlertDialogPortal";
var AlertDialogPortal$1 = (props) => {
  const { __scopeAlertDialog, ...portalProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { ...dialogScope, ...portalProps });
};
AlertDialogPortal$1.displayName = PORTAL_NAME;
var OVERLAY_NAME = "AlertDialogOverlay";
var AlertDialogOverlay$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, { ...dialogScope, ...overlayProps, ref: forwardedRef });
  }
);
AlertDialogOverlay$1.displayName = OVERLAY_NAME;
var CONTENT_NAME = "AlertDialogContent";
var [AlertDialogContentProvider, useAlertDialogContentContext] = createAlertDialogContext(CONTENT_NAME);
var Slottable = createSlottable("AlertDialogContent");
var AlertDialogContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const cancelRef = reactExports.useRef(null);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      WarningProvider,
      {
        contentName: CONTENT_NAME,
        titleName: TITLE_NAME,
        docsSlug: "alert-dialog",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogContentProvider, { scope: __scopeAlertDialog, cancelRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Content,
          {
            role: "alertdialog",
            ...dialogScope,
            ...contentProps,
            ref: composedRefs,
            onOpenAutoFocus: composeEventHandlers(contentProps.onOpenAutoFocus, (event) => {
              var _a;
              event.preventDefault();
              (_a = cancelRef.current) == null ? void 0 : _a.focus({ preventScroll: true });
            }),
            onPointerDownOutside: (event) => event.preventDefault(),
            onInteractOutside: (event) => event.preventDefault(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Slottable, { children }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionWarning, { contentRef })
            ]
          }
        ) })
      }
    );
  }
);
AlertDialogContent$1.displayName = CONTENT_NAME;
var TITLE_NAME = "AlertDialogTitle";
var AlertDialogTitle$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { ...dialogScope, ...titleProps, ref: forwardedRef });
  }
);
AlertDialogTitle$1.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "AlertDialogDescription";
var AlertDialogDescription$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeAlertDialog, ...descriptionProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Description, { ...dialogScope, ...descriptionProps, ref: forwardedRef });
});
AlertDialogDescription$1.displayName = DESCRIPTION_NAME;
var ACTION_NAME = "AlertDialogAction";
var AlertDialogAction$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Close, { ...dialogScope, ...actionProps, ref: forwardedRef });
  }
);
AlertDialogAction$1.displayName = ACTION_NAME;
var CANCEL_NAME = "AlertDialogCancel";
var AlertDialogCancel$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Close, { ...dialogScope, ...cancelProps, ref });
  }
);
AlertDialogCancel$1.displayName = CANCEL_NAME;
var DescriptionWarning = ({ contentRef }) => {
  const MESSAGE = `\`${CONTENT_NAME}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${CONTENT_NAME}\` by passing a \`${DESCRIPTION_NAME}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${CONTENT_NAME}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
  reactExports.useEffect(() => {
    var _a;
    const hasDescription = document.getElementById(
      (_a = contentRef.current) == null ? void 0 : _a.getAttribute("aria-describedby")
    );
    if (!hasDescription) console.warn(MESSAGE);
  }, [MESSAGE, contentRef]);
  return null;
};
var Root2 = AlertDialog$1;
var Portal2 = AlertDialogPortal$1;
var Overlay2 = AlertDialogOverlay$1;
var Content2 = AlertDialogContent$1;
var Action = AlertDialogAction$1;
var Cancel = AlertDialogCancel$1;
var Title2 = AlertDialogTitle$1;
var Description2 = AlertDialogDescription$1;
function AlertDialog({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { "data-slot": "alert-dialog", ...props });
}
function AlertDialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { "data-slot": "alert-dialog-portal", ...props });
}
function AlertDialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Overlay2,
    {
      "data-slot": "alert-dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function AlertDialogContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Content2,
      {
        "data-slot": "alert-dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props
      }
    )
  ] });
}
function AlertDialogHeader({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert-dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function AlertDialogFooter({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert-dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function AlertDialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Title2,
    {
      "data-slot": "alert-dialog-title",
      className: cn("text-lg font-semibold", className),
      ...props
    }
  );
}
function AlertDialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Description2,
    {
      "data-slot": "alert-dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function AlertDialogAction({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Action,
    {
      className: cn(buttonVariants(), className),
      ...props
    }
  );
}
function AlertDialogCancel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Cancel,
    {
      className: cn(buttonVariants({ variant: "outline" }), className),
      ...props
    }
  );
}
function useTypedActor$4() {
  const { actor, isFetching } = useActor(createActor);
  return { actor: actor ? actor : null, isFetching };
}
const defaultEmploymentForm = {
  funktion: "",
  von: (() => {
    const now = /* @__PURE__ */ new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })(),
  bis: "",
  feiertagsberechnungsart: "keineGutschrift",
  pensum: "100",
  stundenMo: "08:00",
  stundenDi: "08:00",
  stundenMi: "08:00",
  stundenDo: "08:00",
  stundenFr: "08:00",
  stundenSa: "00:00",
  stundenSo: "00:00"
};
function employmentToForm(e) {
  return {
    funktion: e.funktion,
    von: timestampToDate(e.von),
    bis: e.bis ? timestampToDate(e.bis) : "",
    feiertagsberechnungsart: normalizeFeiertag(
      String(e.feiertagsberechnungsart)
    ),
    pensum: String(e.pensum),
    stundenMo: bigintToHhMm(e.stundenMo),
    stundenDi: bigintToHhMm(e.stundenDi),
    stundenMi: bigintToHhMm(e.stundenMi),
    stundenDo: bigintToHhMm(e.stundenDo),
    stundenFr: bigintToHhMm(e.stundenFr),
    stundenSa: bigintToHhMm(e.stundenSa),
    stundenSo: bigintToHhMm(e.stundenSo)
  };
}
function formToInput$1(f) {
  const parseMin = (s) => BigInt(hhmmToMinutes(s) ?? 0);
  const pensumVal = f.pensum === "" ? 0 : Number.parseFloat(f.pensum);
  return {
    funktion: f.funktion,
    von: dateToTimestamp(f.von),
    bis: f.bis ? dateToTimestamp(f.bis) : void 0,
    feiertagsberechnungsart: f.feiertagsberechnungsart,
    pensum: Number.isFinite(pensumVal) ? pensumVal : 0,
    stundenMo: parseMin(f.stundenMo),
    stundenDi: parseMin(f.stundenDi),
    stundenMi: parseMin(f.stundenMi),
    stundenDo: parseMin(f.stundenDo),
    stundenFr: parseMin(f.stundenFr),
    stundenSa: parseMin(f.stundenSa),
    stundenSo: parseMin(f.stundenSo)
  };
}
function normalizeFeiertag(v) {
  if (v === "keineGutschrift" || v === "wochentag_sollzeit" || v === "durchschnittssoll")
    return v;
  if (v === "exakt" || v === "entschaedigt") return "keineGutschrift";
  if (v === "exaktWochentag") return "wochentag_sollzeit";
  if (v === "prozentual") return "durchschnittssoll";
  return "keineGutschrift";
}
const FEIERTAGS_OPTIONS = [
  {
    value: "keineGutschrift",
    label: "Keine Gutschrift",
    hilfetext: "An Feiertagen wird keine Zeit gutgeschrieben. Gutschrift = 0:00."
  },
  {
    value: "wochentag_sollzeit",
    label: "Gutschrift gemäss Wochentags-Sollzeit",
    hilfetext: "Die Gutschrift entspricht der hinterlegten Sollzeit des betroffenen Wochentags. Beispiel: Freitag-Sollzeit 6:00, Feiertag auf Freitag = Gutschrift 6:00."
  },
  {
    value: "durchschnittssoll",
    label: "Gutschrift gemäss Durchschnittssoll",
    hilfetext: "Die Gutschrift entspricht dem Durchschnitt der wöchentlichen Sollzeit (Wochen-Soll ÷ Anzahl Arbeitstage). Beispiel: 40:00 / 5 Tage = Gutschrift 8:00."
  }
];
const WEEKDAY_FIELDS = [
  { key: "stundenMo", label: "Montag" },
  { key: "stundenDi", label: "Dienstag" },
  { key: "stundenMi", label: "Mittwoch" },
  { key: "stundenDo", label: "Donnerstag" },
  { key: "stundenFr", label: "Freitag" },
  { key: "stundenSa", label: "Samstag" },
  { key: "stundenSo", label: "Sonntag" }
];
function EmploymentSection({ employeeId, canWrite }) {
  const { actor, isFetching } = useTypedActor$4();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultEmploymentForm);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [showWarning, setShowWarning] = reactExports.useState(false);
  const [dialogError, setDialogError] = reactExports.useState(null);
  const [formSnapshot, setFormSnapshot] = reactExports.useState(
    null
  );
  const isAddModeRef = reactExports.useRef(false);
  const queryKey = ["employments", String(employeeId)];
  const { data: defaultWorkHours } = useQuery({
    queryKey: ["defaultWorkHours"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await actor.getDefaultWorkHours();
        const r = result;
        return r.__kind__ === "ok" && r.ok ? r.ok : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
  reactExports.useEffect(() => {
    if (!defaultWorkHours || !dialogOpen || !isAddModeRef.current) return;
    const toHhMm = (mins) => {
      const m = Number(mins);
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    };
    setForm((prev) => ({
      ...prev,
      stundenMo: toHhMm(defaultWorkHours.stundenMo),
      stundenDi: toHhMm(defaultWorkHours.stundenDi),
      stundenMi: toHhMm(defaultWorkHours.stundenMi),
      stundenDo: toHhMm(defaultWorkHours.stundenDo),
      stundenFr: toHhMm(defaultWorkHours.stundenFr),
      stundenSa: toHhMm(defaultWorkHours.stundenSa),
      stundenSo: toHhMm(defaultWorkHours.stundenSo)
    }));
  }, [defaultWorkHours, dialogOpen]);
  const { data: employments = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!actor) return [];
      const res = await actor.listEmployments(employeeId);
      if (res.__kind__ === "err") return [];
      return res.ok;
    },
    enabled: !!actor && !isFetching
  });
  const [editItemSnapshot, setEditItemSnapshot] = reactExports.useState(
    null
  );
  const saveMutation = useMutation({
    mutationFn: async ({
      editTarget,
      formSnapshotData
    }) => {
      if (!actor) throw new Error("Kein Actor");
      const input = formToInput$1(formSnapshotData);
      if (editTarget) {
        const upd = input;
        const res2 = await actor.updateEmployment(
          employeeId,
          editTarget.id,
          upd
        );
        if (res2.__kind__ === "err") throw new Error(res2.err);
        return res2.ok;
      }
      const res = await actor.createEmployment(employeeId, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey });
      ue.success(
        variables.editTarget ? "Beschäftigung aktualisiert" : "Beschäftigung hinzugefügt"
      );
      setDialogOpen(false);
      setShowWarning(false);
      setEditItemSnapshot(null);
      setFormSnapshot(null);
    },
    onError: (e) => {
      ue.error(`Fehler beim Speichern: ${e.message}`);
      setShowWarning(false);
      setEditItemSnapshot(null);
      setFormSnapshot(null);
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteEmployment(employeeId, id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      ue.success("Beschäftigung gelöscht");
      setDeleteTarget(null);
    },
    onError: (e) => ue.error(e.message)
  });
  function validate() {
    if (!form.funktion.trim()) return "Funktion ist ein Pflichtfeld.";
    if (!form.von) return "Von-Datum ist ein Pflichtfeld.";
    if (!form.bis) {
      const openEnded = employments.filter(
        (e) => !e.bis && (!editItem || e.id !== editItem.id)
      );
      if (openEnded.length > 0)
        return "Es darf nur eine Beschäftigung ohne Bis-Datum erfasst sein.";
    }
    const FAR_FUTURE = "2999-12-31";
    const newVon = form.von;
    const newBis = form.bis || FAR_FUTURE;
    for (const emp of employments) {
      if (editItem && emp.id === editItem.id) continue;
      const empVon = timestampToDate(emp.von);
      const empBis = emp.bis ? timestampToDate(emp.bis) : FAR_FUTURE;
      if (newVon <= empBis && newBis >= empVon) {
        const displayVon = formatDateDE$1(empVon);
        const displayBis = emp.bis ? formatDateDE$1(timestampToDate(emp.bis)) : "offen";
        return `Der Zeitraum überschneidet sich mit einer bestehenden Beschäftigung vom ${displayVon} bis ${displayBis}.`;
      }
    }
    return null;
  }
  function handleSaveClick() {
    const err = validate();
    if (err) {
      setDialogError(err);
      ue.error("Beschäftigung konnte nicht gespeichert werden", {
        description: err,
        duration: 6e3
      });
      return;
    }
    setDialogError(null);
    const editSnapshot = editItem;
    const currentFormSnapshot = { ...form };
    if (editSnapshot) {
      setEditItemSnapshot(editSnapshot);
      setFormSnapshot(currentFormSnapshot);
      setShowWarning(true);
    } else {
      saveMutation.mutate({
        editTarget: null,
        formSnapshotData: currentFormSnapshot
      });
    }
  }
  function handleWarningConfirm() {
    const snapshot = {
      editTarget: editItemSnapshot,
      formSnapshotData: formSnapshot ?? form
    };
    setShowWarning(false);
    saveMutation.mutate(snapshot);
  }
  function openAdd() {
    setEditItem(null);
    isAddModeRef.current = true;
    if (defaultWorkHours) {
      const toHhMm = (mins) => {
        const m = Number(mins);
        const h = Math.floor(m / 60);
        const min = m % 60;
        return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      };
      setForm({
        ...defaultEmploymentForm,
        stundenMo: toHhMm(defaultWorkHours.stundenMo),
        stundenDi: toHhMm(defaultWorkHours.stundenDi),
        stundenMi: toHhMm(defaultWorkHours.stundenMi),
        stundenDo: toHhMm(defaultWorkHours.stundenDo),
        stundenFr: toHhMm(defaultWorkHours.stundenFr),
        stundenSa: toHhMm(defaultWorkHours.stundenSa),
        stundenSo: toHhMm(defaultWorkHours.stundenSo)
      });
    } else {
      setForm(defaultEmploymentForm);
    }
    setDialogError(null);
    setDialogOpen(true);
  }
  function openEdit(emp) {
    setEditItem(emp);
    isAddModeRef.current = false;
    setForm(employmentToForm(emp));
    setDialogError(null);
    setDialogOpen(true);
  }
  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (dialogError) setDialogError(null);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Beschäftigungen" }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        "Hinzufügen"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Funktion" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Von" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Bis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Pensum %" }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: employments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: canWrite ? 5 : 4,
          className: "text-center py-6 text-muted-foreground text-sm",
          children: "Keine Beschäftigungen erfasst"
        }
      ) }) : employments.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: emp.funktion }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateDE$1(timestampToDate(emp.von)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: emp.bis ? formatDateDE$1(timestampToDate(emp.bis)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "offen" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right", children: [
          emp.pensum,
          "%"
        ] }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8",
              onClick: () => openEdit(emp),
              "aria-label": "Bearbeiten",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 text-destructive hover:text-destructive",
              onClick: () => setDeleteTarget(emp),
              "aria-label": "Löschen",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }) })
      ] }, emp.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: dialogOpen,
        onOpenChange: (open) => {
          if (!open && (showWarning || saveMutation.isPending)) return;
          if (!open) setDialogError(null);
          setDialogOpen(open);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Beschäftigung bearbeiten" : "Beschäftigung hinzufügen" }) }),
          dialogError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dialogError })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 col-span-2 sm:col-span-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "emp-funktion", children: "Funktion *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "emp-funktion",
                    value: form.funktion,
                    onChange: (e) => setField("funktion", e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feiertagsberechnungsart" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: form.feiertagsberechnungsart,
                    onValueChange: (v) => setField("feiertagsberechnungsart", v),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FEIERTAGS_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
                    ]
                  }
                ),
                (() => {
                  const opt = FEIERTAGS_OPTIONS.find(
                    (o) => o.value === form.feiertagsberechnungsart
                  );
                  if (!opt) return null;
                  let example = "";
                  if (opt.value === "keineGutschrift") {
                    example = "Gutschrift: 0:00";
                  } else if (opt.value === "wochentag_sollzeit") {
                    const weekdayEntries = [
                      { label: "Montag", key: "stundenMo" },
                      { label: "Dienstag", key: "stundenDi" },
                      { label: "Mittwoch", key: "stundenMi" },
                      { label: "Donnerstag", key: "stundenDo" },
                      { label: "Freitag", key: "stundenFr" },
                      { label: "Samstag", key: "stundenSa" },
                      { label: "Sonntag", key: "stundenSo" }
                    ];
                    const firstWorkday = weekdayEntries.find(
                      (e) => (hhmmToMinutes(form[e.key]) ?? 0) > 0
                    );
                    if (firstWorkday) {
                      example = `Beispiel: ${firstWorkday.label} ${form[firstWorkday.key]}`;
                    } else {
                      example = "Beispiel: Wochentag-Sollzeit (gemäss Beschäftigung)";
                    }
                  } else if (opt.value === "durchschnittssoll") {
                    const vals = [
                      form.stundenMo,
                      form.stundenDi,
                      form.stundenMi,
                      form.stundenDo,
                      form.stundenFr,
                      form.stundenSa,
                      form.stundenSo
                    ].map((s) => hhmmToMinutes(s) ?? 0);
                    const workDays = vals.filter((v) => v > 0).length;
                    const weekTotal = vals.reduce((a, b) => a + b, 0);
                    if (workDays > 0) {
                      const avgMins = Math.round(weekTotal / workDays);
                      const h = Math.floor(avgMins / 60);
                      const m = String(avgMins % 60).padStart(2, "0");
                      example = `Beispiel: Ø ${h}:${m} pro Tag`;
                    } else {
                      example = "Beispiel: Ø-Sollzeit pro Tag (gemäss Beschäftigung)";
                    }
                  }
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 rounded-md bg-muted/50 border border-border px-3 py-2 space-y-0.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: opt.hilfetext }),
                    example && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-primary font-medium", children: example })
                  ] });
                })()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "emp-von", children: "Von *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "emp-von",
                    type: "date",
                    value: form.von,
                    onChange: (e) => setField("von", e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "emp-bis", children: "Bis" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "emp-bis",
                    type: "date",
                    value: form.bis,
                    placeholder: "tt.mm.jjjj",
                    onChange: (e) => setField("bis", e.target.value)
                  }
                ),
                !form.bis && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Leer lassen = offen (kein Enddatum)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "emp-pensum", children: "Pensum %" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "emp-pensum",
                    type: "number",
                    min: 0,
                    max: 100,
                    value: form.pensum,
                    onChange: (e) => setField("pensum", e.target.value)
                  }
                ),
                (form.pensum === "0" || form.pensum === "") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 dark:text-amber-400 mt-1", children: "Keine Soll-Zeit vorgegeben – Mitarbeiter arbeitet nach Belieben" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mb-3", children: "Arbeitsstunden pro Wochentag (hh:mm)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: WEEKDAY_FIELDS.map(({ key, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `emp-${key}`, children: label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: `emp-${key}`,
                    placeholder: "hh:mm",
                    value: form[key],
                    onChange: (e) => setField(key, e.target.value),
                    onBlur: (e) => {
                      const normalized = normalizeTimeInput(e.target.value);
                      if (normalized) setField(key, normalized);
                    }
                  }
                )
              ] }, key)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            dialogError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full bg-destructive/10 border border-destructive/30 rounded-md p-2.5 text-destructive text-xs flex items-start gap-1.5 mr-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dialogError })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => setDialogOpen(false),
                children: "Abbrechen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                "data-ocid": "employment-save",
                onClick: handleSaveClick,
                disabled: saveMutation.isPending,
                children: saveMutation.isPending ? "Speichern..." : "Speichern"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlertDialog,
      {
        open: showWarning,
        onOpenChange: (open) => {
          if (!open && saveMutation.isPending) return;
          if (!open) {
            setShowWarning(false);
            setEditItemSnapshot(null);
            setFormSnapshot(null);
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { className: "flex items-center gap-2 text-amber-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5" }),
              "Achtung — Nachträgliche Änderung"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { className: "text-sm leading-relaxed", children: [
              "Die nachträgliche Änderung einer Beschäftigung kann Auswirkungen auf berechnete Zeiten und Ferienguthaben haben. Bitte überprüfen Sie Ihre Eingaben sorgfältig, bevor Sie speichern.",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Möchten Sie diese Änderung wirklich speichern?" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogCancel,
              {
                onClick: () => {
                  setShowWarning(false);
                  setEditItemSnapshot(null);
                  setFormSnapshot(null);
                },
                children: "Abbrechen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                onClick: handleWarningConfirm,
                className: "bg-amber-600 hover:bg-amber-700 text-white",
                "data-ocid": "employment-warning-confirm",
                children: "Ja, Änderungen speichern"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: !!deleteTarget,
        onConfirm: () => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        },
        onCancel: () => setDeleteTarget(null),
        isDeleting: deleteMutation.isPending
      }
    )
  ] });
}
function useTypedActor$3() {
  const { actor, isFetching } = useActor(createActor);
  return { actor: actor ? actor : null, isFetching };
}
const defaultForm$4 = {
  typ: Variant_gutschrift_reduktion.gutschrift,
  wirkungsdatum: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
  dauer: "000:00",
  ueberzeit: "000:00",
  bemerkung: ""
};
function correctionToForm(c) {
  return {
    typ: c.typ,
    wirkungsdatum: timestampToDate(c.wirkungsdatum),
    dauer: minutesToHhhMm(Number(c.dauer)),
    ueberzeit: minutesToHhhMm(Number(c.ueberzeit)),
    bemerkung: c.bemerkung
  };
}
function TimeBalanceCorrectionSection({ employeeId, canWrite }) {
  const { actor, isFetching } = useTypedActor$3();
  const genericActor = actor ? actor : null;
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm$4);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const correctionQueryKey = ["timeBalanceCorrections", String(employeeId)];
  const workBalanceQueryKey = ["realWorkTimeBalance", String(employeeId)];
  const { data: corrections = [], isLoading } = useQuery({
    queryKey: correctionQueryKey,
    queryFn: async () => {
      if (!actor) return [];
      const res = await actor.listTimeBalanceCorrections(employeeId);
      if (res.__kind__ === "err") return [];
      return res.ok;
    },
    enabled: !!actor && !isFetching
  });
  const { data: employments = [] } = useQuery({
    queryKey: ["employments-tbc", String(employeeId)],
    queryFn: async () => {
      if (!genericActor) return [];
      try {
        const res = await genericActor.listEmployments(employeeId);
        return res.__kind__ === "ok" ? res.ok ?? [] : [];
      } catch {
        return [];
      }
    },
    enabled: !!genericActor && !isFetching,
    staleTime: 6e4
  });
  const employmentStartDate = (() => {
    if (employments.length === 0) return null;
    const valid = employments.filter((e) => {
      if (!e.von || e.von <= 0n) return false;
      const ms = Number(e.von) * 1e3;
      const year = new Date(ms).getFullYear();
      return year >= 2e3 && year <= 2100;
    });
    if (valid.length === 0) return null;
    const earliest = valid.reduce((min, e) => e.von < min.von ? e : min);
    return nanosToLocalIsoDate(earliest.von);
  })();
  const todayIso = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", {
    timeZone: "Europe/Zurich"
  });
  const { data: workTimeBalance } = useQuery({
    queryKey: [...workBalanceQueryKey, employmentStartDate, todayIso],
    queryFn: async () => {
      if (!genericActor || !employmentStartDate) return null;
      try {
        const res = await genericActor.getEmployeeWorkTimeBalance(
          employeeId,
          employmentStartDate,
          todayIso
        );
        return res.__kind__ === "ok" ? res.ok ?? null : null;
      } catch {
        return null;
      }
    },
    enabled: !!genericActor && !isFetching && !!employmentStartDate,
    staleTime: 3e4
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const dauerMin = hhhmmToMinutes(form.dauer);
      const ueberzeitMin = hhhmmToMinutes(form.ueberzeit);
      if (dauerMin === null) throw new Error("Ungültiges Dauerformat (hhh:mm)");
      if (ueberzeitMin === null)
        throw new Error("Ungültiges Überzeitformat (hhh:mm)");
      if (editItem) {
        const input2 = {
          typ: form.typ,
          wirkungsdatum: dateToTimestamp(form.wirkungsdatum),
          dauer: BigInt(dauerMin),
          ueberzeit: BigInt(ueberzeitMin),
          bemerkung: form.bemerkung
        };
        const res2 = await actor.updateTimeBalanceCorrection(
          employeeId,
          editItem.id,
          input2
        );
        if (res2.__kind__ === "err") throw new Error(res2.err);
        return res2.ok;
      }
      const input = {
        typ: form.typ,
        wirkungsdatum: dateToTimestamp(form.wirkungsdatum),
        dauer: BigInt(dauerMin),
        ueberzeit: BigInt(ueberzeitMin),
        bemerkung: form.bemerkung
      };
      const res = await actor.createTimeBalanceCorrection(employeeId, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: correctionQueryKey });
      qc.invalidateQueries({ queryKey: workBalanceQueryKey });
      ue.success(
        editItem ? "Zeitsaldokorrektur aktualisiert" : "Zeitsaldokorrektur hinzugefügt"
      );
      setDialogOpen(false);
    },
    onError: (e) => ue.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteTimeBalanceCorrection(employeeId, id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: correctionQueryKey });
      qc.invalidateQueries({ queryKey: workBalanceQueryKey });
      ue.success("Zeitsaldokorrektur gelöscht");
      setDeleteTarget(null);
    },
    onError: (e) => ue.error(e.message)
  });
  function openAdd() {
    setEditItem(null);
    setForm(defaultForm$4);
    setDialogOpen(true);
  }
  function openEdit(c) {
    setEditItem(c);
    setForm(correctionToForm(c));
    setDialogOpen(true);
  }
  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  const balanceMinutes = workTimeBalance != null ? Number(workTimeBalance.saldo) : null;
  const balanceIsPositive = balanceMinutes != null && balanceMinutes > 0;
  const balanceIsNegative = balanceMinutes != null && balanceMinutes < 0;
  const isLoadingBalance = workTimeBalance === void 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border p-4 bg-muted/20 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-primary shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Aktueller Zeitsaldo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: `text-xl font-semibold font-mono ${balanceIsNegative ? "text-red-700" : balanceIsPositive ? "text-emerald-700" : "text-foreground"}`,
            children: isLoadingBalance || balanceMinutes === null ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-24 inline-block" }) : `${balanceIsPositive ? "+" : balanceIsNegative ? "−" : ""}${minutesToHhhMm(Math.abs(balanceMinutes))}`
          }
        ),
        !isLoadingBalance && employmentStartDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
          "Kumuliert ab ",
          employmentStartDate.split("-").reverse().join("."),
          " ",
          "bis heute"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Zeitsaldokorrekturen" }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        "Hinzufügen"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Typ" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Wirkungsdatum" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Dauer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Überzeit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Bemerkung" }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: corrections.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: canWrite ? 6 : 5,
          className: "text-center py-6 text-muted-foreground text-sm",
          children: "Keine Zeitsaldokorrekturen erfasst"
        }
      ) }) : corrections.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            variant: c.typ === "gutschrift" ? "default" : "secondary",
            children: c.typ === "gutschrift" ? "Gutschrift" : "Reduktion"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateDE$1(timestampToDate(c.wirkungsdatum)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: minutesToHhhMm(Number(c.dauer)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: minutesToHhhMm(Number(c.ueberzeit)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[200px] truncate text-muted-foreground", children: c.bemerkung || "—" }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8",
              onClick: () => openEdit(c),
              "aria-label": "Bearbeiten",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 text-destructive hover:text-destructive",
              onClick: () => setDeleteTarget(c),
              "aria-label": "Löschen",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }) })
      ] }, c.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Zeitsaldokorrektur bearbeiten" : "Zeitsaldokorrektur hinzufügen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Typ *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.typ,
                onValueChange: (v) => setField("typ", v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "gutschrift", children: "Gutschrift" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reduktion", children: "Reduktion" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "tc-datum", children: "Wirkungsdatum *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "tc-datum",
                type: "date",
                value: form.wirkungsdatum,
                onChange: (e) => setField("wirkungsdatum", e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "tc-dauer", children: "Dauer (hhh:mm) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "tc-dauer",
                placeholder: "000:00",
                value: form.dauer,
                onChange: (e) => setField("dauer", e.target.value),
                className: "font-mono",
                maxLength: 10
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "tc-ueberzeit", children: "Überzeit (hhh:mm)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "tc-ueberzeit",
                placeholder: "000:00",
                value: form.ueberzeit,
                onChange: (e) => setField("ueberzeit", e.target.value),
                className: "font-mono",
                maxLength: 10
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "tc-bemerkung", children: "Bemerkung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "tc-bemerkung",
              value: form.bemerkung,
              onChange: (e) => setField("bemerkung", e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDialogOpen(false),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": "timecorrection-save",
            onClick: () => saveMutation.mutate(),
            disabled: saveMutation.isPending,
            children: saveMutation.isPending ? "Speichern..." : "Speichern"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: !!deleteTarget,
        onConfirm: () => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        },
        onCancel: () => setDeleteTarget(null),
        isDeleting: deleteMutation.isPending
      }
    )
  ] });
}
function useTypedActor$2() {
  const { actor, isFetching } = useActor(createActor);
  return { actor: actor ? actor : null, isFetching };
}
const defaultForm$3 = {
  kalenderjahr: String((/* @__PURE__ */ new Date()).getFullYear()),
  dauer: "20",
  verfallsdatum: ""
};
function balanceToForm(b) {
  return {
    kalenderjahr: String(b.kalenderjahr),
    dauer: formatVacationDays(b.dauer),
    verfallsdatum: b.verfallsdatum ? timestampToDate(b.verfallsdatum) : ""
  };
}
function VacationBalanceSection({ employeeId, canWrite }) {
  const { actor, isFetching } = useTypedActor$2();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm$3);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(
    null
  );
  const queryKey = ["vacationBalances", String(employeeId)];
  const { data: balances = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!actor) return [];
      const res = await actor.listVacationBalances(employeeId);
      if (res.__kind__ === "err") return [];
      return res.ok;
    },
    enabled: !!actor && !isFetching
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const dauerBigint = parseVacationDays(form.dauer);
      if (dauerBigint === null) throw new Error("Ungültige Dauer");
      const year = Number.parseInt(form.kalenderjahr, 10);
      if (!year || year < 1900 || year > 2100)
        throw new Error("Ungültiges Kalenderjahr");
      if (editItem) {
        const input2 = {
          kalenderjahr: BigInt(year),
          dauer: dauerBigint,
          verfallsdatum: form.verfallsdatum ? dateToTimestamp(form.verfallsdatum) : void 0
        };
        const res2 = await actor.updateVacationBalance(
          employeeId,
          editItem.id,
          input2
        );
        if (res2.__kind__ === "err") throw new Error(res2.err);
        return res2.ok;
      }
      const input = {
        kalenderjahr: BigInt(year),
        dauer: dauerBigint,
        verfallsdatum: form.verfallsdatum ? dateToTimestamp(form.verfallsdatum) : void 0
      };
      const res = await actor.createVacationBalance(employeeId, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      ue.success(
        editItem ? "Ferienguthaben aktualisiert" : "Ferienguthaben hinzugefügt"
      );
      setDialogOpen(false);
    },
    onError: (e) => ue.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteVacationBalance(employeeId, id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      ue.success("Ferienguthaben gelöscht");
      setDeleteTarget(null);
    },
    onError: (e) => ue.error(e.message)
  });
  function openAdd() {
    setEditItem(null);
    setForm(defaultForm$3);
    setDialogOpen(true);
  }
  function openEdit(b) {
    setEditItem(b);
    setForm(balanceToForm(b));
    setDialogOpen(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Ferienguthaben" }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        "Hinzufügen"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Kalenderjahr" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Dauer (Tage)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Verfallsdatum" }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: balances.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: canWrite ? 4 : 3,
          className: "text-center py-6 text-muted-foreground text-sm",
          children: "Keine Ferienguthaben erfasst"
        }
      ) }) : balances.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: String(b.kalenderjahr) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: formatVacationDays(b.dauer) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: b.verfallsdatum ? formatDateDE$1(timestampToDate(b.verfallsdatum)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "—" }) }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8",
              onClick: () => openEdit(b),
              "aria-label": "Bearbeiten",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 text-destructive hover:text-destructive",
              onClick: () => setDeleteTarget(b),
              "aria-label": "Löschen",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }) })
      ] }, b.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Ferienguthaben bearbeiten" : "Ferienguthaben hinzufügen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vb-jahr", children: "Kalenderjahr *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "vb-jahr",
              type: "number",
              min: 2e3,
              max: 2100,
              value: form.kalenderjahr,
              onChange: (e) => setForm({ ...form, kalenderjahr: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vb-dauer", children: "Dauer (Tage, z.B. 20 oder 10.5) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "vb-dauer",
              type: "number",
              step: "0.01",
              min: "0",
              placeholder: "z.B. 20 oder 10.5",
              value: form.dauer,
              onChange: (e) => setForm({ ...form, dauer: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "vb-verfall", children: "Verfallsdatum" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "vb-verfall",
              type: "date",
              value: form.verfallsdatum,
              onChange: (e) => setForm({ ...form, verfallsdatum: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDialogOpen(false),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": "vacationbalance-save",
            onClick: () => saveMutation.mutate(),
            disabled: saveMutation.isPending,
            children: saveMutation.isPending ? "Speichern..." : "Speichern"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: !!deleteTarget,
        onConfirm: () => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        },
        onCancel: () => setDeleteTarget(null),
        isDeleting: deleteMutation.isPending
      }
    )
  ] });
}
function useTypedActor$1() {
  const { actor, isFetching } = useActor(createActor);
  return {
    actor: actor ? actor : null,
    isFetching
  };
}
function bigintToDateStr(ts) {
  if (!ts || ts === BigInt(0)) return "";
  const d = new Date(Number(ts) * 1e3);
  return d.toISOString().split("T")[0];
}
function dateStrToBigint(s) {
  if (!s) return void 0;
  return BigInt(Math.floor((/* @__PURE__ */ new Date(`${s}T00:00:00Z`)).getTime() / 1e3));
}
function MitarbeiterDetail({
  employee,
  canWrite,
  allPlans,
  companyIdStr,
  companySubscriptions: _companySubscriptions,
  onBack,
  onUpdated
}) {
  var _a;
  const { actor } = useTypedActor$1();
  const qc = useQueryClient();
  const [personalForm, setPersonalForm] = reactExports.useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    role: employee.role,
    geburtsdatum: bigintToDateStr(employee.geburtsdatum),
    startDate: employee.startDate ?? "",
    adresseZusatz1: employee.adresseZusatz1 ?? "",
    adresseZusatz2: employee.adresseZusatz2 ?? "",
    strasse: employee.strasse ?? "",
    postfach: employee.postfach ?? "",
    plz: employee.plz ?? "",
    ort: employee.ort ?? "",
    land: employee.land ?? ""
  });
  const [complianceOpen, setComplianceOpen] = reactExports.useState(false);
  const [complianceForm, setComplianceForm] = reactExports.useState({
    aktiv: false,
    gesetzlicheWochenhochstarbeitszeit: 45,
    gesetzlicherFerienanspruchWochen: 4,
    vertraglicheZusatzferienTage: 0,
    ausnahmeprofil: ""
  });
  const { data: employments = [] } = useQuery({
    queryKey: ["employments", String(employee.id)],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const res = await actor.listEmployments(employee.id);
        if (res.__kind__ === "ok") return res.ok;
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && complianceOpen
  });
  const vertraglicheWochenstundenReadOnly = (() => {
    if (!employments.length) return 40;
    const todayIso = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const activeEmp = getActiveEmploymentForDate(employments, todayIso);
    if (!activeEmp) return 40;
    const totalMinutes = Number(activeEmp.stundenMo) + Number(activeEmp.stundenDi) + Number(activeEmp.stundenMi) + Number(activeEmp.stundenDo) + Number(activeEmp.stundenFr) + Number(activeEmp.stundenSa) + Number(activeEmp.stundenSo);
    const hours = totalMinutes / 60;
    return Math.round(hours * 10) / 10;
  })();
  const { data: complianceProfile, isLoading: complianceLoading } = useQuery({
    queryKey: ["complianceProfile", String(employee.id)],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getComplianceProfile(employee.id);
      } catch {
        return null;
      }
    },
    enabled: !!actor && complianceOpen
  });
  reactExports.useEffect(() => {
    if (complianceProfile) {
      setComplianceForm({
        aktiv: complianceProfile.aktiv,
        gesetzlicheWochenhochstarbeitszeit: complianceProfile.gesetzlicheWochenhochstarbeitszeit,
        gesetzlicherFerienanspruchWochen: complianceProfile.gesetzlicherFerienanspruchWochen,
        vertraglicheZusatzferienTage: complianceProfile.vertraglicheZusatzferienTage,
        ausnahmeprofil: complianceProfile.ausnahmeprofil ?? ""
      });
    }
  }, [complianceProfile]);
  const [activeOverride, setActiveOverride] = reactExports.useState(null);
  const displayActive = activeOverride !== null ? activeOverride : employee.active;
  const [planChangeOpen, setPlanChangeOpen] = reactExports.useState(false);
  const [planChangeInfo, setPlanChangeInfo] = reactExports.useState(
    null
  );
  const [pendingToggleActive, setPendingToggleActive] = reactExports.useState(null);
  const { data: allEmployees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listEmployees();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 3e4
  });
  const [selectedSupervisorId, setSelectedSupervisorId] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (employee == null ? void 0 : employee.id) {
      const saved = localStorage.getItem(`supervisor_${String(employee.id)}`);
      setSelectedSupervisorId(saved || "");
    }
  }, [employee == null ? void 0 : employee.id]);
  const supervisorOptions = allEmployees.filter(
    (e) => (e.role === "admin" || e.role === "manager") && String(e.id) !== String(employee.id)
  );
  const updatePersonalMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const input = {
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        email: personalForm.email,
        role: personalForm.role,
        geburtsdatum: dateStrToBigint(personalForm.geburtsdatum),
        startDate: personalForm.startDate || void 0,
        adresseZusatz1: personalForm.adresseZusatz1 || void 0,
        adresseZusatz2: personalForm.adresseZusatz2 || void 0,
        strasse: personalForm.strasse || void 0,
        postfach: personalForm.postfach || void 0,
        plz: personalForm.plz || void 0,
        ort: personalForm.ort || void 0,
        land: personalForm.land || void 0
      };
      const res = await actor.updateEmployee(employee.id, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      ue.success("Persoenliche Daten gespeichert");
      onUpdated(updated);
    },
    onError: (e) => ue.error(e.message)
  });
  const updateComplianceMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const profileId = (complianceProfile == null ? void 0 : complianceProfile.id) ?? BigInt(0);
      const input = {
        id: profileId,
        employeeId: employee.id,
        aktiv: complianceForm.aktiv,
        gesetzlicheWochenhochstarbeitszeit: complianceForm.gesetzlicheWochenhochstarbeitszeit,
        gesetzlicherFerienanspruchWochen: complianceForm.gesetzlicherFerienanspruchWochen,
        vertraglicheZusatzferienTage: complianceForm.vertraglicheZusatzferienTage,
        ausnahmeprofil: complianceForm.ausnahmeprofil || void 0,
        erfassungsModus: (complianceProfile == null ? void 0 : complianceProfile.erfassungsModus) ?? "vollstaendig"
      };
      const res = await actor.updateComplianceProfile(input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["complianceProfile", String(employee.id)]
      });
      ue.success("Compliance-Profil gespeichert");
    },
    onError: (e) => ue.error(e.message)
  });
  const planChangeMutation = useMutation({
    mutationFn: async ({
      billingModel,
      newActive
    }) => {
      if (!actor || !companyIdStr) throw new Error("Kein Actor");
      const suggestedPlanId = planChangeInfo == null ? void 0 : planChangeInfo.suggestedPlanId;
      if (suggestedPlanId) {
        const anyActor = actor;
        if (typeof anyActor.applyPlanChange === "function") {
          await anyActor.applyPlanChange(
            BigInt(companyIdStr),
            suggestedPlanId,
            billingModel
          );
        } else {
          await anyActor.assignSubscriptionPlan(
            String(companyIdStr),
            suggestedPlanId
          );
          await actor.setCompanyBillingModel(
            BigInt(companyIdStr),
            billingModel
          );
        }
      } else {
        await actor.setCompanyBillingModel(BigInt(companyIdStr), billingModel);
      }
      if (pendingToggleActive !== null) {
        const res = await actor.setEmployeeActive(employee.id, newActive);
        if (res.__kind__ === "err") throw new Error(res.err);
        return res.ok;
      }
      return null;
    },
    onSuccess: (updated) => {
      if (updated) {
        setActiveOverride(updated.active);
        onUpdated(updated);
      }
      void qc.invalidateQueries({ queryKey: ["employees"] });
      void qc.invalidateQueries({ queryKey: ["allCompanySubscriptions"] });
      void qc.invalidateQueries({ queryKey: ["monthlyBilling"] });
      void qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      setPlanChangeOpen(false);
      setPlanChangeInfo(null);
      setPendingToggleActive(null);
      ue.success(
        pendingToggleActive ? "Mitarbeiter aktiviert, Plan angepasst" : "Mitarbeiter deaktiviert, Plan angepasst"
      );
    },
    onError: (e) => {
      setActiveOverride(null);
      setPlanChangeOpen(false);
      ue.error(e.message);
    }
  });
  const toggleActiveMutation = useMutation({
    mutationFn: async (active) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.setEmployeeActive(employee.id, active);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (updated) => {
      setActiveOverride(updated.active);
      onUpdated(updated);
      void qc.invalidateQueries({ queryKey: ["employees"] });
      void qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      ue.success(
        updated.active ? "Mitarbeiter aktiviert" : "Mitarbeiter deaktiviert"
      );
      if (actor && companyIdStr) {
        const anyActor = actor;
        if (typeof anyActor.updateStripeSubscriptionQuantity === "function") {
          actor.listEmployees().then((emps) => {
            const cnt = emps.filter((e) => e.active).length;
            return anyActor.updateStripeSubscriptionQuantity(
              BigInt(companyIdStr),
              BigInt(cnt)
            );
          }).then((r) => {
            const qr = r;
            if (qr.__kind__ === "err" && qr.err) {
              console.warn("[Stripe] Quantity update failed:", qr.err);
            }
          }).catch((ex) => {
            console.warn("[Stripe] Quantity update exception:", ex);
          });
        }
      }
    },
    onError: (e) => {
      setActiveOverride(null);
      ue.error(`Status konnte nicht geaendert werden: ${e.message}`);
    }
  });
  async function handleStatusToggle(newActive) {
    if (!actor) return;
    let freshEmployees = allEmployees;
    try {
      freshEmployees = await actor.listEmployees();
    } catch {
    }
    let freshPlans = allPlans;
    if (freshPlans.length === 0) {
      try {
        freshPlans = await actor.getSubscriptionPlans();
      } catch {
      }
    }
    if (freshPlans.length === 0) {
      toggleActiveMutation.mutate(newActive);
      return;
    }
    let freshPlanId = "";
    try {
      if (companyIdStr) {
        const companyPlan = await actor.getCompanySubscriptionPlan(
          BigInt(companyIdStr)
        );
        if (companyPlan) {
          freshPlanId = companyPlan.id;
        }
      }
    } catch {
    }
    const currentActiveCount = freshEmployees.filter((e) => e.active).length;
    const expectedActiveCount = newActive ? currentActiveCount + 1 : Math.max(0, currentActiveCount - 1);
    const planChangeNeeded = checkPlanChange(
      freshPlans,
      currentActiveCount,
      expectedActiveCount,
      freshPlanId
    );
    if (planChangeNeeded) {
      if (newActive) {
        setPendingToggleActive(newActive);
        setPlanChangeInfo(planChangeNeeded);
        setPlanChangeOpen(true);
        qc.setQueryData(["employees"], freshEmployees);
        qc.setQueryData(["subscriptionPlans"], freshPlans);
      } else {
        try {
          const res = await actor.setEmployeeActive(employee.id, newActive);
          if (res.__kind__ === "err") throw new Error(res.err);
          setActiveOverride(res.ok.active);
          onUpdated(res.ok);
          void qc.invalidateQueries({ queryKey: ["employees"] });
          setPendingToggleActive(newActive);
          setPlanChangeInfo(planChangeNeeded);
          setPlanChangeOpen(true);
          qc.setQueryData(["subscriptionPlans"], freshPlans);
        } catch (err) {
          setActiveOverride(null);
          ue.error(
            `Status konnte nicht geändert werden: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    } else {
      toggleActiveMutation.mutate(newActive);
    }
  }
  function pf(field) {
    return (e) => setPersonalForm({ ...personalForm, [field]: e.target.value });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: onBack,
          className: "gap-2 text-muted-foreground",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Zurueck"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold truncate", children: [
          employee.firstName,
          " ",
          employee.lastName
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: displayActive ? "default" : "secondary", children: displayActive ? "Aktiv" : "Inaktiv" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "personal", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap h-auto gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "personal", "data-ocid": "tab-personal", children: "Persoenliche Daten" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "anstellung", "data-ocid": "tab-anstellung", children: "Anstellung / Beschaeftigung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "ferien", "data-ocid": "tab-ferien", children: "Ferienguthaben" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "zeitsaldo", "data-ocid": "tab-zeitsaldo", children: "Zeitsaldokorrektur" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "status", "data-ocid": "tab-status", children: "Status" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "personal", className: "mt-4 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-firstName", children: "Vorname *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "pd-firstName",
                value: personalForm.firstName,
                onChange: pf("firstName"),
                disabled: !canWrite
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-lastName", children: "Nachname *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "pd-lastName",
                value: personalForm.lastName,
                onChange: pf("lastName"),
                disabled: !canWrite
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-email", children: "E-Mail *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "pd-email",
                type: "email",
                value: personalForm.email,
                onChange: pf("email"),
                disabled: !canWrite
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-geburtsdatum", children: "Geburtsdatum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "pd-geburtsdatum",
                type: "date",
                value: personalForm.geburtsdatum,
                onChange: pf("geburtsdatum"),
                disabled: !canWrite
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-startDate", children: "Eintrittsdatum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "pd-startDate",
                type: "date",
                value: personalForm.startDate,
                onChange: pf("startDate"),
                disabled: !canWrite,
                "data-ocid": "mitarbeiter-startdate-input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rolle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: personalForm.role,
                onValueChange: (v) => setPersonalForm({ ...personalForm, role: v }),
                disabled: !canWrite,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "Administrator" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Manager" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "employee", children: "Mitarbeiter" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-supervisor", children: "Vorgesetzter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "pd-supervisor",
                value: selectedSupervisorId,
                onChange: (e) => {
                  setSelectedSupervisorId(e.target.value);
                  if (employee == null ? void 0 : employee.id) {
                    if (e.target.value) {
                      localStorage.setItem(
                        `supervisor_${String(employee.id)}`,
                        e.target.value
                      );
                    } else {
                      localStorage.removeItem(
                        `supervisor_${String(employee.id)}`
                      );
                    }
                  }
                },
                disabled: !canWrite,
                className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006066] disabled:opacity-50 disabled:cursor-not-allowed",
                "data-ocid": "mitarbeiter-supervisor-select",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Kein Vorgesetzter" }),
                  supervisorOptions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: String(s.id), children: [
                    s.firstName,
                    " ",
                    s.lastName
                  ] }, String(s.id)))
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground mb-3", children: "Adresse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-zusatz1", children: "Adresse Zusatz 1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "pd-zusatz1",
                  value: personalForm.adresseZusatz1,
                  onChange: pf("adresseZusatz1"),
                  disabled: !canWrite
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-zusatz2", children: "Adresse Zusatz 2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "pd-zusatz2",
                  value: personalForm.adresseZusatz2,
                  onChange: pf("adresseZusatz2"),
                  disabled: !canWrite
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-strasse", children: "Strasse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "pd-strasse",
                  value: personalForm.strasse,
                  onChange: pf("strasse"),
                  disabled: !canWrite
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-postfach", children: "Postfach" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "pd-postfach",
                  value: personalForm.postfach,
                  onChange: pf("postfach"),
                  disabled: !canWrite
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-plz", children: "PLZ" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "pd-plz",
                  value: personalForm.plz,
                  onChange: pf("plz"),
                  disabled: !canWrite
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-ort", children: "Ort" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "pd-ort",
                  value: personalForm.ort,
                  onChange: pf("ort"),
                  disabled: !canWrite
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pd-land", children: "Land" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "pd-land",
                  value: personalForm.land,
                  onChange: pf("land"),
                  disabled: !canWrite
                }
              )
            ] })
          ] })
        ] }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => updatePersonalMutation.mutate(),
            disabled: updatePersonalMutation.isPending,
            className: "gap-2",
            "data-ocid": "mitarbeiter-personal-save",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
              updatePersonalMutation.isPending ? "Speichern..." : "Speichern"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors rounded-lg",
              onClick: () => setComplianceOpen((v) => !v),
              "data-ocid": "compliance-profile-toggle",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Compliance-Profil" }),
                complianceOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-muted-foreground" })
              ]
            }
          ),
          complianceOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4 pt-1 space-y-4 border-t border-border", children: complianceLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-2", children: "Wird geladen..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            !complianceProfile && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2", children: "Kein Compliance-Profil vorhanden. Mit «Speichern» wird ein neues Profil angelegt." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 col-span-full sm:col-span-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cp-aktiv", className: "text-sm", children: "Compliance-Prüfung aktiv" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    id: "cp-aktiv",
                    checked: complianceForm.aktiv,
                    onCheckedChange: (v) => setComplianceForm({ ...complianceForm, aktiv: v }),
                    disabled: !canWrite,
                    "data-ocid": "compliance-aktiv-toggle"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Vertragliche Wochenstunden" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { "data-ocid": "compliance-wochenstunden-readonly", children: [
                    vertraglicheWochenstundenReadOnly,
                    " h"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs ml-auto opacity-60", children: "aus Beschäftigung" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gesetzliche Wochenhöchstarbeitszeit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: String(
                      complianceForm.gesetzlicheWochenhochstarbeitszeit
                    ),
                    onValueChange: (v) => setComplianceForm({
                      ...complianceForm,
                      gesetzlicheWochenhochstarbeitszeit: Number.parseFloat(v)
                    }),
                    disabled: !canWrite,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "compliance-maxstunden-select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "45", children: "45 Stunden" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "50", children: "50 Stunden" })
                      ] })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cp-ferien", children: "Gesetzlicher Ferienanspruch (Wochen)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "cp-ferien",
                    type: "number",
                    step: "0.5",
                    min: "4",
                    max: "8",
                    value: complianceForm.gesetzlicherFerienanspruchWochen,
                    onChange: (e) => setComplianceForm({
                      ...complianceForm,
                      gesetzlicherFerienanspruchWochen: Number.parseFloat(e.target.value) || 4
                    }),
                    disabled: !canWrite,
                    "data-ocid": "compliance-ferienanspruch-input"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cp-zusatzferien", children: "Vertragliche Zusatzferien (Tage)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "cp-zusatzferien",
                    type: "number",
                    step: "1",
                    min: "0",
                    value: complianceForm.vertraglicheZusatzferienTage,
                    onChange: (e) => setComplianceForm({
                      ...complianceForm,
                      vertraglicheZusatzferienTage: Number.parseFloat(e.target.value) || 0
                    }),
                    disabled: !canWrite,
                    "data-ocid": "compliance-zusatzferien-input"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cp-ausnahme", children: "Ausnahmeprofil" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "cp-ausnahme",
                    value: complianceForm.ausnahmeprofil,
                    onChange: (e) => setComplianceForm({
                      ...complianceForm,
                      ausnahmeprofil: e.target.value
                    }),
                    disabled: !canWrite,
                    placeholder: "z.B. GAV-Bau, Kader",
                    "data-ocid": "compliance-ausnahme-input"
                  }
                )
              ] })
            ] }),
            canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                onClick: () => updateComplianceMutation.mutate(),
                disabled: updateComplianceMutation.isPending,
                variant: "outline",
                className: "gap-2",
                "data-ocid": "compliance-save-button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
                  updateComplianceMutation.isPending ? "Speichern..." : "Speichern"
                ]
              }
            ) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "anstellung", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmploymentSection, { employeeId: employee.id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ferien", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        VacationBalanceSection,
        {
          employeeId: employee.id,
          canWrite
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "zeitsaldo", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TimeBalanceCorrectionSection,
        {
          employeeId: employee.id,
          canWrite
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "status", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border p-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Mitarbeiterstatus" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: displayActive ? "Aktiv" : "Inaktiv" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: displayActive ? "Der Mitarbeiter ist aktiv und kann das System nutzen." : "Der Mitarbeiter ist inaktiv und hat keinen Zugang zum System." })
          ] }),
          canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: displayActive,
              onCheckedChange: (checked) => handleStatusToggle(checked),
              disabled: toggleActiveMutation.isPending || planChangeMutation.isPending,
              "data-ocid": "mitarbeiter-status-toggle"
            }
          )
        ] }),
        toggleActiveMutation.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2",
            "data-ocid": "mitarbeiter-status-error",
            children: ((_a = toggleActiveMutation.error) == null ? void 0 : _a.message) ?? "Unbekannter Fehler"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PlanChangeDialog,
      {
        open: planChangeOpen,
        info: planChangeInfo,
        allPlans,
        isLoading: planChangeMutation.isPending,
        onConfirm: (billingModel) => {
          if (pendingToggleActive !== null) {
            planChangeMutation.mutate({
              billingModel,
              newActive: pendingToggleActive
            });
          }
        },
        onCancel: () => {
          setPlanChangeOpen(false);
          setPlanChangeInfo(null);
          if (pendingToggleActive === true) {
            setActiveOverride(null);
          }
          setPendingToggleActive(null);
          if (pendingToggleActive === false) {
            ue.success(
              "Mitarbeiter deaktiviert. Plan wurde nicht geaendert."
            );
          }
        }
      }
    )
  ] });
}
function useTypedActor() {
  const { actor, isFetching } = useActor(createActor);
  return {
    actor: actor ? actor : null,
    isFetching
  };
}
const defaultForm$2 = {
  firstName: "",
  lastName: "",
  email: "",
  role: "employee",
  employmentType: "fullTime",
  startDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
};
function MitarbeiterTab() {
  const { role, companyId: companyIdStr } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useTypedActor();
  const qc = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = reactExports.useState(false);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [purgeTarget, setPurgeTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm$2);
  const [errors, setErrors] = reactExports.useState({});
  const [detailEmployee, setDetailEmployee] = reactExports.useState(null);
  const [inviteDialog, setInviteDialog] = reactExports.useState({
    open: false,
    employeeName: "",
    url: "",
    copied: false
  });
  const [planChangeOpen, setPlanChangeOpen] = reactExports.useState(false);
  const [planChangeInfo, setPlanChangeInfo] = reactExports.useState(
    null
  );
  const [planChangeAction, setPlanChangeAction] = reactExports.useState("create");
  const [stripeCheckoutError, setStripeCheckoutError] = reactExports.useState(
    null
  );
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listEmployees();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching
  });
  const { data: allPlans = [] } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubscriptionPlans();
    },
    enabled: !!actor && !isFetching,
    staleTime: 12e4
  });
  const { data: companySubscriptions = [] } = useQuery(
    {
      queryKey: ["allCompanySubscriptions"],
      queryFn: async () => {
        if (!actor) return [];
        try {
          const res = await actor.getAllCompanySubscriptions();
          return res;
        } catch {
          return [];
        }
      },
      enabled: !!actor && !isFetching,
      staleTime: 12e4
    }
  );
  async function doCreateEmployee(currentActor) {
    const input = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: form.role,
      employmentType: form.employmentType,
      startDate: form.startDate,
      weeklyHoursTarget: 0
    };
    const res = await currentActor.createEmployee(input);
    if (res.__kind__ === "err") throw new Error(res.err);
    const newEmployee = res.ok;
    try {
      const [projects, serviceTypes] = await Promise.all([
        currentActor.listProjects(),
        currentActor.listServiceTypes()
      ]);
      const internProject = projects.find(
        (p) => {
          var _a, _b;
          return ((_a = p.name) == null ? void 0 : _a.toLowerCase()) === "intern" || ((_b = p.code) == null ? void 0 : _b.toLowerCase()) === "intern";
        }
      );
      const interneAdminSt = serviceTypes.find(
        (st) => {
          var _a, _b;
          return ((_a = st.name) == null ? void 0 : _a.toLowerCase().includes("interne administration")) || ((_b = st.name) == null ? void 0 : _b.toLowerCase().includes("interne admin"));
        }
      );
      if (internProject && interneAdminSt && newEmployee) {
        const membersRes = await currentActor.getProjectMembers(
          internProject.id
        );
        const existingMembers = membersRes.__kind__ === "ok" ? membersRes.ok : [];
        const alreadyAssigned = existingMembers.some(
          (m) => String(m.employeeId) === String(newEmployee.id)
        );
        if (!alreadyAssigned) {
          const updatedMembers = [
            ...existingMembers,
            {
              employeeId: newEmployee.id,
              serviceTypeId: interneAdminSt.id,
              stundensatz: 0
            }
          ];
          await currentActor.setProjectMembers(
            internProject.id,
            updatedMembers
          );
        }
      }
    } catch {
    }
    return newEmployee;
  }
  async function fireStripeQuantityUpdate(currentActor) {
    if (!companyIdStr) return;
    try {
      const freshEmp = await currentActor.listEmployees();
      const newActiveCount = freshEmp.filter((e) => e.active).length;
      const anyActor = currentActor;
      if (typeof anyActor.updateStripeSubscriptionQuantity === "function") {
        anyActor.updateStripeSubscriptionQuantity(
          BigInt(companyIdStr),
          BigInt(newActiveCount)
        ).then((r) => {
          const res = r;
          if (res.__kind__ === "err" && res.err) {
            console.warn("[Stripe] Quantity update failed:", res.err);
          }
        }).catch((e) => {
          console.warn("[Stripe] Quantity update exception:", e);
        });
      }
    } catch {
    }
  }
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      return doCreateEmployee(actor);
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      ue.success("Mitarbeiter erstellt");
      setAddDialogOpen(false);
      setForm(defaultForm$2);
      if (actor) void fireStripeQuantityUpdate(actor);
    },
    onError: (e) => {
      ue.error(e.message);
    }
  });
  const planChangeMutation = useMutation({
    mutationFn: async ({
      billingModel,
      action
    }) => {
      var _a;
      if (!actor || !companyIdStr) throw new Error("Kein Actor");
      const suggestedPlanId = planChangeInfo == null ? void 0 : planChangeInfo.suggestedPlanId;
      let appliedPlan = null;
      if (suggestedPlanId) {
        const anyActor = actor;
        if (typeof anyActor.applyPlanChange === "function") {
          await anyActor.applyPlanChange(
            BigInt(companyIdStr),
            suggestedPlanId,
            billingModel
          );
        } else {
          await anyActor.assignSubscriptionPlan(
            String(companyIdStr),
            suggestedPlanId
          );
          await actor.setCompanyBillingModel(
            BigInt(companyIdStr),
            billingModel
          );
        }
        appliedPlan = allPlans.find((p) => p.id === suggestedPlanId) ?? null;
      } else {
        await actor.setCompanyBillingModel(BigInt(companyIdStr), billingModel);
      }
      const needsStripe = (appliedPlan == null ? void 0 : appliedPlan.requiresPayment) === true && !!((appliedPlan == null ? void 0 : appliedPlan.stripePriceId) || (appliedPlan == null ? void 0 : appliedPlan.stripePriceIdYearly));
      if (action === "create") await doCreateEmployee(actor);
      if (needsStripe && appliedPlan && companyIdStr) {
        try {
          const checkoutResult = await actor.createStripeCheckoutSession(
            BigInt(companyIdStr),
            appliedPlan.id,
            billingModel
          );
          if (checkoutResult.__kind__ === "ok" && ((_a = checkoutResult.ok) == null ? void 0 : _a.url)) {
            return { stripeUrl: checkoutResult.ok.url };
          }
          const errMsg = checkoutResult.err ?? "Checkout-Session konnte nicht erstellt werden";
          console.error("[Stripe] Checkout Session Fehler:", errMsg);
          throw new Error(
            `Fehler beim Erstellen der Stripe-Sitzung: ${errMsg}`
          );
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("[Stripe] Checkout Session Exception:", msg);
          throw new Error(
            msg.startsWith("Fehler beim Erstellen") ? msg : `Fehler beim Erstellen der Stripe-Sitzung: ${msg}`
          );
        }
      }
      return {};
    },
    onSuccess: ({ stripeUrl }, { action }) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["allCompanySubscriptions"] });
      qc.invalidateQueries({ queryKey: ["monthlyBilling"] });
      qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      if (stripeUrl) {
        if (action === "create") {
          setAddDialogOpen(false);
          setForm(defaultForm$2);
        } else {
          setDeleteTarget(null);
        }
        setPlanChangeOpen(false);
        setPlanChangeInfo(null);
        setStripeCheckoutError(null);
        setTimeout(() => {
          window.location.href = stripeUrl;
        }, 100);
        return;
      }
      setPlanChangeOpen(false);
      setPlanChangeInfo(null);
      setStripeCheckoutError(null);
      if (action === "create") {
        ue.success("Mitarbeiter erstellt, Plan angepasst");
        setAddDialogOpen(false);
        setForm(defaultForm$2);
      } else {
        ue.success("Plan angepasst");
        setDeleteTarget(null);
      }
    },
    onError: (e) => {
      console.error("[PlanChange] Fehler beim Planwechsel:", e);
      setStripeCheckoutError(
        `Fehler beim Erstellen der Stripe-Sitzung: ${e.message}`
      );
      ue.error(e.message);
    }
  });
  const checkDowngradeAfterRemoval = reactExports.useCallback(
    async (currentActor) => {
      if (!companyIdStr) return;
      let freshEmployees = employees;
      try {
        freshEmployees = await currentActor.listEmployees();
      } catch {
      }
      let freshPlans = allPlans;
      try {
        freshPlans = await currentActor.getSubscriptionPlans();
      } catch {
        freshPlans = allPlans;
      }
      if (freshPlans.length === 0) return;
      let currentPlan = null;
      try {
        currentPlan = await currentActor.getCompanySubscriptionPlan(
          BigInt(companyIdStr)
        );
      } catch {
      }
      if (!currentPlan) return;
      const newActiveCount = freshEmployees.filter((e) => e.active).length;
      const suggestedPlan = checkDowngradeNeeded(
        newActiveCount,
        freshPlans,
        currentPlan
      );
      if (suggestedPlan) {
        const planInfo = {
          currentPlanName: currentPlan.name,
          suggestedPlanName: suggestedPlan.name,
          suggestedPlanId: suggestedPlan.id,
          activeUserCount: BigInt(newActiveCount),
          isUpgrade: false
        };
        qc.setQueryData(["employees"], freshEmployees);
        qc.setQueryData(["subscriptionPlans"], freshPlans);
        setPlanChangeInfo(planInfo);
        setPlanChangeOpen(true);
      }
    },
    [companyIdStr, employees, allPlans, qc]
  );
  const deactivateMutation = useMutation({
    mutationFn: async (emp) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteEmployee(emp.id);
      if (res.__kind__ === "err") throw new Error(res.err);
      return { emp, currentActor: actor };
    },
    onSuccess: async ({ currentActor }) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      setDeleteTarget(null);
      ue.success("Mitarbeiter deaktiviert");
      setPlanChangeAction("deactivate");
      await checkDowngradeAfterRemoval(currentActor);
      void fireStripeQuantityUpdate(currentActor);
    },
    onError: (e) => {
      ue.error(e.message);
    }
  });
  const purgeMutation = useMutation({
    mutationFn: async (emp) => {
      if (!actor) throw new Error("Kein Actor");
      const anyActor = actor;
      if (typeof anyActor.purgeEmployee === "function") {
        const res = await anyActor.purgeEmployee(emp.id);
        if (res.__kind__ === "err")
          throw new Error(res.err ?? "Fehler beim Loeschen");
      } else {
        throw new Error(
          "Dieser Mitarbeiter kann nicht geloescht werden. Die Funktion ist im Backend noch nicht verfuegbar."
        );
      }
      return { currentActor: actor };
    },
    onSuccess: async ({ currentActor }) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["headerSubscriptionPlan"] });
      ue.success("Mitarbeiter geloescht");
      setPurgeTarget(null);
      setPlanChangeAction("purge");
      await checkDowngradeAfterRemoval(currentActor);
      void fireStripeQuantityUpdate(currentActor);
    },
    onError: (e) => {
      ue.error(e.message);
      setPurgeTarget(null);
    }
  });
  const inviteMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.generateInviteCode(id);
      if (res.__kind__ === "err") throw new Error(res.err);
      return { code: res.ok, name };
    },
    onSuccess: ({ code, name }) => {
      const url = `${window.location.origin}/einladung?code=${code}`;
      localStorage.setItem(`inviteCode_${code}`, url);
      setInviteDialog({ open: true, employeeName: name, url, copied: false });
    },
    onError: (e) => ue.error(e.message)
  });
  async function copyInviteUrl() {
    try {
      await navigator.clipboard.writeText(inviteDialog.url);
      setInviteDialog((d) => ({ ...d, copied: true }));
      setTimeout(() => setInviteDialog((d) => ({ ...d, copied: false })), 2e3);
    } catch {
      ue.error("Kopieren fehlgeschlagen");
    }
  }
  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Pflichtfeld";
    if (!form.lastName.trim()) errs.lastName = "Pflichtfeld";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Gueltige E-Mail erforderlich";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }
  function openAdd() {
    setForm(defaultForm$2);
    setErrors({});
    setAddDialogOpen(true);
  }
  async function handleSaveClick() {
    if (!validate() || !actor) return;
    let freshEmployees = employees;
    try {
      freshEmployees = await actor.listEmployees();
    } catch {
    }
    let freshPlans = allPlans;
    try {
      freshPlans = await actor.getSubscriptionPlans();
    } catch {
    }
    if (freshPlans.length === 0) {
      saveMutation.mutate();
      return;
    }
    let currentPlanId = "";
    try {
      if (companyIdStr) {
        const companyPlan = await actor.getCompanySubscriptionPlan(
          BigInt(companyIdStr)
        );
        if (companyPlan) {
          currentPlanId = companyPlan.id;
        }
      }
    } catch {
    }
    const currentActiveCount = freshEmployees.filter((e) => e.active).length;
    const expectedActiveCount = currentActiveCount + 1;
    const planChangeNeeded = checkPlanChange(
      freshPlans,
      currentActiveCount,
      expectedActiveCount,
      currentPlanId
    );
    if (planChangeNeeded) {
      qc.setQueryData(["employees"], freshEmployees);
      qc.setQueryData(["subscriptionPlans"], freshPlans);
      setPlanChangeInfo(planChangeNeeded);
      setPlanChangeAction("create");
      setPlanChangeOpen(true);
    } else {
      saveMutation.mutate();
    }
  }
  if (detailEmployee) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      MitarbeiterDetail,
      {
        employee: detailEmployee,
        canWrite,
        allPlans,
        companyIdStr: companyIdStr ?? "",
        companySubscriptions,
        onBack: () => setDetailEmployee(null),
        onUpdated: (emp) => {
          setDetailEmployee(emp);
          qc.invalidateQueries({ queryKey: ["employees"] });
        }
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        employees.length,
        " Mitarbeiter"
      ] }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "mitarbeiter-add",
          onClick: openAdd,
          size: "sm",
          className: "gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Mitarbeiter hinzufuegen"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "E-Mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Rolle" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: employees.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: 5,
          className: "text-center py-8 text-muted-foreground",
          children: "Keine Mitarbeiter vorhanden"
        }
      ) }) : employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          "data-ocid": "mitarbeiter-row",
          className: "cursor-pointer hover:bg-muted/20",
          onClick: () => setDetailEmployee(emp),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-medium", children: [
              emp.firstName,
              " ",
              emp.lastName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: emp.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: getRoleLabel(emp.role) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: emp.active ? "default" : "secondary", children: emp.active ? "Aktiv" : "Inaktiv" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TableCell,
              {
                className: "text-right",
                onClick: (e) => e.stopPropagation(),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end gap-1", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "icon",
                      className: "h-8 w-8",
                      onClick: () => inviteMutation.mutate({
                        id: emp.id,
                        name: `${emp.firstName} ${emp.lastName}`
                      }),
                      disabled: inviteMutation.isPending,
                      "aria-label": "Einladungslink generieren",
                      title: "Einladungslink generieren",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "icon",
                      className: "h-8 w-8",
                      onClick: () => setDetailEmployee(emp),
                      "aria-label": "Bearbeiten",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserPen, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "icon",
                      className: "h-8 w-8 text-destructive hover:text-destructive",
                      title: emp.active ? "Mitarbeiter deaktivieren" : "Mitarbeiter loeschen",
                      onClick: () => {
                        if (emp.active) {
                          setDeleteTarget(emp);
                        } else {
                          setPurgeTarget(emp);
                        }
                      },
                      "aria-label": emp.active ? "Deaktivieren" : "Loeschen",
                      "data-ocid": "mitarbeiter-delete-button",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                    }
                  )
                ] }) })
              }
            )
          ]
        },
        String(emp.id)
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addDialogOpen, onOpenChange: setAddDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mitarbeiter hinzufuegen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-firstName", children: "Vorname *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "add-firstName",
                "data-ocid": "mitarbeiter-firstname",
                value: form.firstName,
                onChange: (e) => setForm({ ...form, firstName: e.target.value })
              }
            ),
            errors.firstName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.firstName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-lastName", children: "Nachname *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "add-lastName",
                "data-ocid": "mitarbeiter-lastname",
                value: form.lastName,
                onChange: (e) => setForm({ ...form, lastName: e.target.value })
              }
            ),
            errors.lastName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.lastName })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-email", children: "E-Mail *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "add-email",
              type: "email",
              "data-ocid": "mitarbeiter-email",
              value: form.email,
              onChange: (e) => setForm({ ...form, email: e.target.value })
            }
          ),
          errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rolle *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.role,
                onValueChange: (v) => setForm({ ...form, role: v }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "mitarbeiter-role", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "Administrator" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Manager" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "employee", children: "Mitarbeiter" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "add-startDate", children: "Eintrittsdatum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "add-startDate",
                type: "date",
                "data-ocid": "mitarbeiter-startdate",
                value: form.startDate,
                onChange: (e) => setForm({ ...form, startDate: e.target.value })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setAddDialogOpen(false),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": "mitarbeiter-save",
            onClick: handleSaveClick,
            disabled: saveMutation.isPending || planChangeMutation.isPending,
            children: saveMutation.isPending || planChangeMutation.isPending ? "Speichern..." : "Speichern"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: inviteDialog.open,
        onOpenChange: (open) => setInviteDialog((d) => ({ ...d, open })),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "w-5 h-5 text-primary" }),
            "Einladungslink fuer ",
            inviteDialog.employeeName
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Kopieren Sie den folgenden Link und senden Sie ihn an den Mitarbeiter." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  readOnly: true,
                  value: inviteDialog.url,
                  "data-ocid": "invite-url-input",
                  className: "text-xs font-mono bg-muted/30 flex-1",
                  onClick: (e) => e.target.select()
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  size: "icon",
                  "data-ocid": "invite-copy-btn",
                  onClick: copyInviteUrl,
                  "aria-label": "Link kopieren",
                  className: "shrink-0",
                  children: inviteDialog.copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4" })
                }
              )
            ] }),
            inviteDialog.copied && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-primary font-medium", children: "Link kopiert" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => setInviteDialog((d) => ({ ...d, open: false })),
                children: "Schliessen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                "data-ocid": "invite-copy-and-close",
                onClick: async () => {
                  await copyInviteUrl();
                  setTimeout(
                    () => setInviteDialog((d) => ({ ...d, open: false })),
                    800
                  );
                },
                className: "gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4" }),
                  "Kopieren & Schliessen"
                ]
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: !!deleteTarget,
        onOpenChange: (o) => {
          if (!o) setDeleteTarget(null);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            "data-ocid": "mitarbeiter.deactivate_dialog",
            className: "max-w-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mitarbeiter deaktivieren?" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground py-2", children: [
                "Moechtest du",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  deleteTarget == null ? void 0 : deleteTarget.firstName,
                  " ",
                  deleteTarget == null ? void 0 : deleteTarget.lastName
                ] }),
                " ",
                "wirklich deaktivieren? Der Mitarbeiter kann sich danach nicht mehr anmelden."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    onClick: () => setDeleteTarget(null),
                    "data-ocid": "mitarbeiter.deactivate_cancel_button",
                    children: "Abbrechen"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "destructive",
                    disabled: deactivateMutation.isPending,
                    "data-ocid": "mitarbeiter.deactivate_confirm_button",
                    onClick: () => {
                      if (deleteTarget) deactivateMutation.mutate(deleteTarget);
                    },
                    children: deactivateMutation.isPending ? "Wird deaktiviert..." : "Deaktivieren"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: !!purgeTarget,
        onOpenChange: (o) => {
          if (!o) setPurgeTarget(null);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            "data-ocid": "mitarbeiter.purge_dialog",
            className: "max-w-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-destructive", children: "Mitarbeiter unwiderruflich loeschen?" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                  "Moechtest du",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                    purgeTarget == null ? void 0 : purgeTarget.firstName,
                    " ",
                    purgeTarget == null ? void 0 : purgeTarget.lastName
                  ] }),
                  " ",
                  "wirklich loeschen? Diese Aktion kann",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "nicht rueckgaengig" }),
                  " gemacht werden."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Hinweis: Mitarbeiter mit vorhandenen Zeiterfassungen, Ferien, Abwesenheiten oder Spesen koennen nicht geloescht werden." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    onClick: () => setPurgeTarget(null),
                    "data-ocid": "mitarbeiter.purge_cancel_button",
                    children: "Abbrechen"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "destructive",
                    disabled: purgeMutation.isPending,
                    "data-ocid": "mitarbeiter.purge_confirm_button",
                    onClick: () => {
                      if (purgeTarget) purgeMutation.mutate(purgeTarget);
                    },
                    children: purgeMutation.isPending ? "Wird geloescht..." : "Ja, loeschen"
                  }
                )
              ] })
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PlanChangeDialog,
      {
        open: planChangeOpen,
        info: planChangeInfo,
        allPlans,
        isLoading: planChangeMutation.isPending,
        checkoutError: stripeCheckoutError,
        onConfirm: (billingModel) => {
          setStripeCheckoutError(null);
          planChangeMutation.mutate({ billingModel, action: planChangeAction });
        },
        onCancel: () => {
          setPlanChangeOpen(false);
          setPlanChangeInfo(null);
          setStripeCheckoutError(null);
          if (planChangeAction === "create") {
            ue.info("Speichern abgebrochen.");
          } else {
            ue.info("Plan wurde nicht geaendert.");
          }
        }
      }
    )
  ] });
}
const toAny = (a) => a;
const STATUS_LABELS = {
  aktiv: "Aktiv",
  inaktiv: "Inaktiv",
  abgeschlossen: "Abgeschlossen"
};
const STATUS_BADGE = {
  aktiv: "bg-emerald-100 text-emerald-800 border-emerald-200",
  inaktiv: "bg-muted text-muted-foreground border-border",
  abgeschlossen: "bg-blue-100 text-blue-800 border-blue-200"
};
let _memberKeyCounter = 0;
const newMemberRow = () => ({
  _key: ++_memberKeyCounter,
  employeeId: "",
  serviceTypeId: "",
  stundensatz: 0,
  kostendachCHF: ""
});
const defaultForm$1 = {
  code: "",
  kurzbezeichnung: "",
  name: "",
  customerId: "",
  projektleiter: "",
  status: "aktiv",
  billableRate: 0,
  active: true,
  erfassungsart: "dauer",
  kostendachCHF: ""
};
function ProjekteTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm$1);
  const [members, setMembers] = reactExports.useState([]);
  const [aufwendungen, setAufwendungen] = reactExports.useState(null);
  const [aufwendungenLoading, setAufwendungenLoading] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const enabled = !!actor && !isFetching;
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listProjects();
    },
    enabled
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listCustomers();
    },
    enabled
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listEmployees();
    },
    enabled
  });
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["serviceTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listServiceTypes();
    },
    enabled
  });
  const customerMap = new Map(customers.map((c) => [String(c.id), c.name]));
  const employeeMap = new Map(
    employees.map((e) => [String(e.id), `${e.firstName} ${e.lastName}`])
  );
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const kostendachVal = form.kostendachCHF.trim() ? Number.parseFloat(form.kostendachCHF.replace(/'/g, "")) : void 0;
      const baseInput = {
        code: form.code,
        kurzbezeichnung: form.kurzbezeichnung,
        name: form.name,
        customerId: BigInt(form.customerId),
        projektleiter: form.projektleiter ? BigInt(form.projektleiter) : void 0,
        status: form.status,
        billableRate: form.billableRate,
        active: form.active,
        erfassungsart: form.erfassungsart === "zeitBlock" ? Erfassungsart.zeitBlock : Erfassungsart.dauer,
        kostendachCHF: kostendachVal
      };
      let projectId;
      if (editItem) {
        const res = await toAny(actor).updateProject(editItem.id, baseInput);
        const r = res;
        if (r.__kind__ === "err")
          throw new Error(r.err ?? "Fehler beim Aktualisieren");
        projectId = editItem.id;
      } else {
        const res = await toAny(actor).createProject(baseInput);
        const r = res;
        if (r.__kind__ === "err")
          throw new Error(r.err ?? "Fehler beim Erstellen");
        projectId = r.ok.id;
      }
      const memberAssignments = members.filter((m) => m.employeeId && m.serviceTypeId).map((m) => ({
        employeeId: BigInt(m.employeeId),
        serviceTypeId: BigInt(m.serviceTypeId),
        stundensatz: m.stundensatz,
        kostendachCHF: m.kostendachCHF.trim() ? Number.parseFloat(m.kostendachCHF.replace(/'/g, "")) : void 0
      }));
      const membRes = await toAny(actor).setProjectMembers(
        projectId,
        memberAssignments
      );
      const mr = membRes;
      if (mr.__kind__ === "err")
        throw new Error(mr.err ?? "Fehler bei Mitarbeiterzuordnung");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      ue.success(editItem ? "Projekt aktualisiert" : "Projekt erstellt");
      setDialogOpen(false);
    },
    onError: (e) => ue.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await toAny(actor).deleteProject(id);
      const r = res;
      if (r.__kind__ === "err") throw new Error(r.err ?? "Fehler");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      ue.success("Projekt gelöscht");
      setDeleteTarget(null);
    },
    onError: (e) => ue.error(e.message)
  });
  function validate() {
    const errs = {};
    if (!form.code.trim()) errs.code = "Pflichtfeld";
    if (!form.name.trim()) errs.name = "Pflichtfeld";
    if (!form.customerId) errs.customerId = "Pflichtfeld";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }
  async function openAdd() {
    setEditItem(null);
    setForm(defaultForm$1);
    setMembers([]);
    setAufwendungen(null);
    setErrors({});
    setDialogOpen(true);
  }
  async function openEdit(p) {
    setEditItem(p);
    setForm({
      code: p.code,
      kurzbezeichnung: p.kurzbezeichnung ?? "",
      name: p.name,
      customerId: String(p.customerId),
      projektleiter: p.projektleiter != null ? String(p.projektleiter) : "",
      status: p.status ?? "aktiv",
      billableRate: p.billableRate,
      active: p.active,
      erfassungsart: p.erfassungsart === Erfassungsart.zeitBlock ? "zeitBlock" : "dauer",
      kostendachCHF: p.kostendachCHF != null ? String(p.kostendachCHF) : ""
    });
    setAufwendungen(null);
    setErrors({});
    if (actor) {
      try {
        const res = await toAny(actor).getProjectMembers(p.id);
        const r = res;
        if (r.__kind__ === "ok" && r.ok) {
          setMembers(
            r.ok.map((m) => ({
              employeeId: String(m.employeeId),
              serviceTypeId: String(m.serviceTypeId),
              stundensatz: m.stundensatz,
              kostendachCHF: m.kostendachCHF != null ? String(m.kostendachCHF) : "",
              _key: ++_memberKeyCounter
            }))
          );
        } else {
          setMembers([]);
        }
      } catch {
        setMembers([]);
      }
      setAufwendungenLoading(true);
      try {
        const aufRes = await actor.getProjectAufwendungen(p.id);
        if (aufRes.__kind__ === "ok") {
          setAufwendungen(aufRes.ok);
        } else {
          setAufwendungen(null);
        }
      } catch {
        setAufwendungen(null);
      } finally {
        setAufwendungenLoading(false);
      }
    }
    setDialogOpen(true);
  }
  function addMemberRow() {
    setMembers((prev) => [...prev, newMemberRow()]);
  }
  function updateMember(index, patch) {
    setMembers(
      (prev) => prev.map((row, i) => i === index ? { ...row, ...patch } : row)
    );
  }
  function removeMember(index) {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  }
  const statusKey = (p) => p.status ?? "aktiv";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        projects.length,
        " Projekte"
      ] }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          "data-ocid": "projekte-add",
          onClick: openAdd,
          size: "sm",
          className: "gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Projekt hinzufügen"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Kurzbezeichnung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Kunde" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Projektleiter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Erfassungsart" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: projects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: canWrite ? 7 : 6,
          className: "text-center py-8 text-muted-foreground",
          children: "Keine Projekte vorhanden"
        }
      ) }) : projects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { "data-ocid": "projekte-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-mono", children: p.code })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: p.kurzbezeichnung || "–" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: customerMap.get(String(p.customerId)) ?? "–" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground", children: p.projektleiter != null ? employeeMap.get(String(p.projektleiter)) ?? "–" : "–" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-border bg-muted/50 text-muted-foreground", children: p.erfassungsart === Erfassungsart.zeitBlock ? "Zeit-Block" : "Dauer" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[statusKey(p)]}`,
            children: STATUS_LABELS[statusKey(p)]
          }
        ) }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8",
              onClick: () => openEdit(p),
              "aria-label": "Bearbeiten",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 text-destructive hover:text-destructive",
              onClick: () => setDeleteTarget(p),
              "aria-label": "Löschen",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }) })
      ] }, String(p.id))) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Projekt bearbeiten" : "Projekt hinzufügen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pname", children: "Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "pname",
                "data-ocid": "projekte-name",
                value: form.name,
                onChange: (e) => setForm({ ...form, name: e.target.value })
              }
            ),
            errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pkurz", children: "Kurzbezeichnung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "pkurz",
                "data-ocid": "projekte-kurzbezeichnung",
                value: form.kurzbezeichnung,
                onChange: (e) => setForm({ ...form, kurzbezeichnung: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pcode", children: "Code *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "pcode",
              "data-ocid": "projekte-code",
              value: form.code,
              onChange: (e) => setForm({ ...form, code: e.target.value })
            }
          ),
          errors.code && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.code })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kunde *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.customerId,
              onValueChange: (v) => setForm({ ...form, customerId: v }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "projekte-customer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Kunde wählen..." }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.name }, String(c.id))) })
              ]
            }
          ),
          errors.customerId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.customerId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Projektleiter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.projektleiter,
                onValueChange: (v) => setForm({
                  ...form,
                  projektleiter: v === "__none__" ? "" : v
                }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "projekte-projektleiter", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Projektleiter wählen..." }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "– Kein Projektleiter –" }),
                    employees.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(e.id), children: [
                      e.firstName,
                      " ",
                      e.lastName
                    ] }, String(e.id)))
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.status,
                onValueChange: (v) => setForm({ ...form, status: v }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "projekte-status", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "aktiv", children: "Aktiv" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inaktiv", children: "Inaktiv" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "abgeschlossen", children: "Abgeschlossen" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Erfassungsart" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.erfassungsart,
              onValueChange: (v) => setForm({
                ...form,
                erfassungsart: v
              }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "projekte-erfassungsart", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dauer", children: "Dauer (hh:mm)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "zeitBlock", children: "Zeit-Block (von/bis hh:mm)" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: form.erfassungsart === "zeitBlock" ? "Zeiteinträge werden mit Von- und Bis-Zeit erfasst" : "Zeiteinträge werden als Dauer in hh:mm erfasst" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pkostendach", children: "Kostendach (CHF)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "pkostendach",
                "data-ocid": "projekte-kostendach",
                type: "number",
                min: 0,
                step: 0.01,
                placeholder: "0.00",
                value: form.kostendachCHF,
                onChange: (e) => setForm({ ...form, kostendachCHF: e.target.value })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Gesamtbudget des Projekts in CHF" })
          ] }),
          editItem && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Aufwendungen (CHF)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                "data-ocid": "projekte-aufwendungen",
                className: "flex h-9 items-center rounded-md border border-input bg-muted/30 px-3 text-sm font-mono",
                children: aufwendungenLoading ? "Wird berechnet…" : aufwendungen != null ? aufwendungen.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'") : "–"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Summe verrechenbarer Leistungen (berechnet)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold", children: "Mitarbeiter-Zuordnung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mitarbeiter, Leistungsart und Stundensatz für dieses Projekt" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                className: "gap-2",
                onClick: addMemberRow,
                "data-ocid": "projekte-add-member",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "w-4 h-4" }),
                  "Mitarbeiter hinzufügen"
                ]
              }
            )
          ] }),
          members.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground", children: "Noch keine Mitarbeiter zugeordnet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mitarbeiter" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Leistungsart" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28 text-right", children: "Stundensatz (CHF)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28 text-right", children: "Kostendach (CHF)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-10" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: members.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { "data-ocid": "projekte-member-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: m.employeeId,
                  onValueChange: (v) => updateMember(i, { employeeId: v }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectTrigger,
                      {
                        className: "h-8 text-xs",
                        "data-ocid": "projekte-member-employee",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Mitarbeiter..." })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: employees.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      SelectItem,
                      {
                        value: String(e.id),
                        children: [
                          e.firstName,
                          " ",
                          e.lastName
                        ]
                      },
                      String(e.id)
                    )) })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: m.serviceTypeId,
                  onValueChange: (v) => {
                    const st = serviceTypes.find(
                      (s) => String(s.id) === v
                    );
                    updateMember(i, {
                      serviceTypeId: v,
                      // Prefill stundensatz from ServiceType.defaultRate, but only if user hasn't manually overridden it (i.e., still 0)
                      stundensatz: m.stundensatz === 0 && st ? st.defaultRate : m.stundensatz
                    });
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectTrigger,
                      {
                        className: "h-8 text-xs",
                        "data-ocid": "projekte-member-service",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Leistungsart..." })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: serviceTypes.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectItem,
                      {
                        value: String(s.id),
                        children: s.name
                      },
                      String(s.id)
                    )) })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 0,
                  step: 0.01,
                  className: "h-8 text-xs text-right",
                  value: m.stundensatz,
                  "data-ocid": "projekte-member-rate",
                  onChange: (e) => updateMember(i, {
                    stundensatz: Number(e.target.value)
                  })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  min: 0,
                  step: 0.01,
                  placeholder: "0.00",
                  className: "h-8 text-xs text-right",
                  value: m.kostendachCHF,
                  "data-ocid": "projekte-member-kostendach",
                  onChange: (e) => updateMember(i, {
                    kostendachCHF: e.target.value
                  })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-1.5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7 text-destructive hover:text-destructive",
                  onClick: () => removeMember(i),
                  "aria-label": "Zeile entfernen",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                }
              ) })
            ] }, m._key)) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDialogOpen(false),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": "projekte-save",
            onClick: () => {
              if (validate()) saveMutation.mutate();
            },
            disabled: saveMutation.isPending,
            children: saveMutation.isPending ? "Speichern..." : "Speichern"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteTarget, onOpenChange: () => setDeleteTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Projekt löschen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Möchten Sie ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget == null ? void 0 : deleteTarget.name }),
        " wirklich löschen?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDeleteTarget(null),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "destructive",
            "data-ocid": "projekte-delete-confirm",
            onClick: () => deleteTarget && deleteMutation.mutate(deleteTarget.id),
            disabled: deleteMutation.isPending,
            children: "Löschen"
          }
        )
      ] })
    ] }) })
  ] });
}
const POSITION_OPTIONS = [
  { value: "links", label: "Links", icon: AlignLeft },
  { value: "zentriert", label: "Zentriert", icon: AlignCenter },
  { value: "rechts", label: "Rechts", icon: AlignRight }
];
const LOGO_GROESSE_OPTIONS = [
  { value: "small", label: "Klein (30px)" },
  { value: "medium", label: "Mittel (60px)" },
  { value: "large", label: "Gross (90px)" }
];
const LOGO_GROESSE_HEIGHT = {
  small: 30,
  medium: 60,
  large: 90
};
function loadLS(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
const DEFAULT_FORM = {
  praefix: "RE-",
  naechsteNummer: "1",
  zahlungszielTage: "30",
  kopftext: "Sehr geehrte Damen und Herren,\n\nWir erlauben uns, Ihnen folgende Leistungen in Rechnung zu stellen:",
  fusstext: "Bitte überweisen Sie den Betrag innerhalb von 30 Tagen.\n\nBank: [bank]\nIBAN: [iban]",
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
  mwstSatz: "8.1"
};
function templateToForm(t, company) {
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
    kopfzeileAdresse: t.kopfzeileAdresse ?? (company ? `${company.name ?? ""}
${company.address ?? ""}`.trim() : ""),
    kopfzeileAdressePosition: t.kopfzeileAdressePosition ?? "links",
    kopfzeileLayout: t.kopfzeileLayout ?? "nebeneinander",
    fusszeileLayout: t.fusszeileLayout ?? "uebereinander",
    kundenadresseAbstandOben: t.kundenadresseAbstandOben != null ? Number(t.kundenadresseAbstandOben) : Number(loadLS("rv_kundenadresse_abstand_oben", "170")) || 170,
    kundenadresseEinrueckungZeichen: t.kundenadresseEinrueckungZeichen != null ? Number(t.kundenadresseEinrueckungZeichen) : Number(loadLS("rv_kundenadresse_einrueckung_zeichen", "0")) || 0,
    kundenadresseAbstandNach: t.kundenadresseAbstandNach != null ? Number(t.kundenadresseAbstandNach) : Number(loadLS("rv_kundenadresse_abstand_nach", "30")) || 30,
    mwstSatz: loadLS("rv_mwst_satz_standard", "8.1")
  };
}
function formToInput(f) {
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
    kopfzeilePosition: f.kopfzeilePosition || void 0,
    fusszeilePosition: f.fusszeilePosition || void 0,
    kopfzeileBildUrl: f.kopfzeileBildUrl || void 0,
    kopfzeileBildPosition: f.kopfzeileBildPosition || void 0,
    fusszeileBildUrl: f.fusszeileBildUrl || void 0,
    fusszeileBildPosition: f.fusszeileBildPosition || void 0,
    qrAktivStandard: f.qrAktivStandard,
    qrIban: f.qrIban || void 0,
    qrKontoinhaber: f.qrKontoinhaber || void 0,
    qrKontoinhaberAdresse: f.qrKontoinhaberAdresse || void 0,
    qrWaehrung: "CHF",
    qrReferenztyp: "NON",
    qrReferenzPraefix: f.qrReferenzPraefix || void 0,
    kopfzeileLogoQuelle: f.kopfzeileLogoQuelle || void 0,
    kopfzeileLogoGroesse: f.kopfzeileLogoGroesse || void 0,
    kopfzeileAdresse: f.kopfzeileAdresse || void 0,
    kopfzeileAdressePosition: f.kopfzeileAdressePosition || void 0,
    kopfzeileLayout: f.kopfzeileLayout || void 0,
    fusszeileLayout: f.fusszeileLayout || void 0,
    // All three spacing fields are stored in px directly (no mm conversion)
    kundenadresseAbstandOben: f.kundenadresseAbstandOben,
    kundenadresseEinrueckungZeichen: BigInt(
      f.kundenadresseEinrueckungZeichen || 0
    ),
    kundenadresseAbstandNach: BigInt(f.kundenadresseAbstandNach || 0)
  };
}
function todayDE() {
  const d = /* @__PURE__ */ new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
function SectionHeading({ number, title, description }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 pb-3 border-b border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-primary", children: number }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-foreground", children: title }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: description })
    ] })
  ] });
}
function PositionControl({
  value,
  onChange,
  disabled,
  id
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "flex rounded-md border border-input overflow-hidden",
      id,
      children: POSITION_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            title: opt.label,
            className: `flex-1 px-2 py-1.5 text-xs transition-colors cursor-pointer text-center select-none flex items-center justify-center gap-1
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${value === opt.value ? "bg-primary text-primary-foreground font-medium" : "bg-background text-muted-foreground hover:bg-muted"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "radio",
                  name: id,
                  value: opt.value,
                  checked: value === opt.value,
                  disabled,
                  onChange: () => !disabled && onChange(opt.value),
                  className: "sr-only"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3 h-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: opt.label })
            ]
          },
          opt.value
        );
      })
    }
  );
}
function LayoutToggle({ value, onChange, disabled, id }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex rounded-md border border-input overflow-hidden",
      id,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            className: `flex-1 px-3 py-1.5 text-xs transition-colors cursor-pointer text-center select-none flex items-center justify-center gap-1.5
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${value === "nebeneinander" ? "bg-primary text-primary-foreground font-medium" : "bg-background text-muted-foreground hover:bg-muted"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "radio",
                  name: id,
                  value: "nebeneinander",
                  checked: value === "nebeneinander",
                  disabled,
                  onChange: () => !disabled && onChange("nebeneinander"),
                  className: "sr-only"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-3 h-3 rotate-90" }),
              "Nebeneinander"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            className: `flex-1 px-3 py-1.5 text-xs transition-colors cursor-pointer text-center select-none flex items-center justify-center gap-1.5
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${value === "uebereinander" ? "bg-primary text-primary-foreground font-medium" : "bg-background text-muted-foreground hover:bg-muted"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "radio",
                  name: id,
                  value: "uebereinander",
                  checked: value === "uebereinander",
                  disabled,
                  onChange: () => !disabled && onChange("uebereinander"),
                  className: "sr-only"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-3 h-3" }),
              "Übereinander"
            ]
          }
        )
      ]
    }
  );
}
function ImageUploadField({
  label,
  imageUrl,
  imagePosition,
  onImageChange,
  onPositionChange,
  onRemove,
  disabled,
  ocidPrefix
}) {
  const fileRef = reactExports.useRef(null);
  function handleFile(e) {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      ue.error("Nur JPG oder PNG erlaubt");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      var _a2;
      return onImageChange((_a2 = ev.target) == null ? void 0 : _a2.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: label }),
    imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-12 border border-border rounded bg-muted/20 overflow-hidden flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: imageUrl,
          alt: label,
          className: "w-full h-full object-contain"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
        !disabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            className: "h-7 text-xs gap-1",
            onClick: () => {
              var _a;
              return (_a = fileRef.current) == null ? void 0 : _a.click();
            },
            "data-ocid": `${ocidPrefix}-change`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3 h-3" }),
              "Ändern"
            ]
          }
        ),
        !disabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            className: "h-7 text-xs gap-1 text-destructive hover:text-destructive",
            onClick: onRemove,
            "data-ocid": `${ocidPrefix}-remove`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }),
              "Entfernen"
            ]
          }
        )
      ] })
    ] }) : !disabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        type: "button",
        variant: "outline",
        size: "sm",
        className: "h-8 text-xs gap-1.5",
        onClick: () => {
          var _a;
          return (_a = fileRef.current) == null ? void 0 : _a.click();
        },
        "data-ocid": `${ocidPrefix}-upload`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-3.5 h-3.5" }),
          "Bild hochladen"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: fileRef,
        type: "file",
        accept: "image/jpeg,image/png",
        className: "hidden",
        onChange: handleFile,
        "aria-label": label
      }
    ),
    imageUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Bildposition" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        PositionControl,
        {
          value: imagePosition,
          onChange: onPositionChange,
          disabled,
          id: `${ocidPrefix}-bild-position`
        }
      )
    ] })
  ] });
}
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
  { key: "[iban]", label: "IBAN" }
];
function PlaceholderChips() {
  const [expanded, setExpanded] = reactExports.useState(false);
  const [copiedKey, setCopiedKey] = reactExports.useState(null);
  function handleCopy(key) {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors",
        onClick: () => setExpanded((v) => !v),
        children: [
          expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5" }),
          "Verfügbare Platzhalter (zum Einfügen anklicken)"
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md border border-border", children: ALL_PLACEHOLDERS.map((ph) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => handleCopy(ph.key),
        title: ph.key,
        className: "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-border text-xs text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors",
        children: [
          copiedKey === ph.key ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-3 h-3 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-[10px]", children: ph.key }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
            "– ",
            ph.label
          ] })
        ]
      },
      ph.key
    )) })
  ] });
}
function alignClass(pos) {
  if (pos === "zentriert") return "text-center items-center";
  if (pos === "rechts") return "text-right items-end";
  return "text-left items-start";
}
function flexAlignClass(pos) {
  if (pos === "zentriert") return "justify-center";
  if (pos === "rechts") return "justify-end";
  return "justify-start";
}
function InvoicePreview({ form, company }) {
  const rechnungsNr = `${form.praefix}${String(form.naechsteNummer || 1).padStart(4, "0")}`;
  const accentColor = form.farbe || "#006066";
  const logoHeight = LOGO_GROESSE_HEIGHT[form.kopfzeileLogoGroesse] ?? 60;
  const headerLogoUrl = form.kopfzeileLogoQuelle === "upload" ? form.kopfzeileBildUrl : (company == null ? void 0 : company.logoUrl) ?? "";
  const isNebeneinander = form.kopfzeileLayout === "nebeneinander";
  const fussNebeneinander = form.fusszeileLayout === "nebeneinander";
  const fiktiveKundenadresse = "Max Muster AG\nMusterstrasse 1\n8000 Zürich";
  const einrueckung = form.kundenadresseEinrueckungZeichen;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background border border-border rounded-lg overflow-hidden text-xs font-mono", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "p-4 border-b border-border",
        style: { borderTopColor: accentColor, borderTopWidth: "3px" },
        children: [
          form.kopfzeileLogoQuelle !== "upload" && form.kopfzeileBildUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `flex mb-2 ${flexAlignClass(form.kopfzeileBildPosition)}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: form.kopfzeileBildUrl,
                  alt: "Kopfzeile Bild",
                  className: "max-h-10 object-contain"
                }
              )
            }
          ),
          isNebeneinander ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-2", children: [
            headerLogoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: headerLogoUrl,
                alt: "Logo",
                style: { height: `${logoHeight * 0.4}px` },
                className: "object-contain flex-shrink-0"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "rounded bg-muted/50 flex items-center justify-center flex-shrink-0",
                style: {
                  width: `${logoHeight * 0.4}px`,
                  height: `${logoHeight * 0.4}px`
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4 text-muted-foreground" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `${alignClass(form.kopfzeileAdressePosition)} flex flex-col`,
                children: form.kopfzeileAdresse ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-foreground whitespace-pre-line leading-tight", children: form.kopfzeileAdresse }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground text-sm", children: (company == null ? void 0 : company.name) || "Firmenname" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-[10px] leading-tight", children: (company == null ? void 0 : company.address) || "Firmenadresse" })
                ] })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `flex ${flexAlignClass(form.kopfzeileAdressePosition)}`,
                children: headerLogoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: headerLogoUrl,
                    alt: "Logo",
                    style: { height: `${logoHeight * 0.4}px` },
                    className: "object-contain"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "rounded bg-muted/50 flex items-center justify-center",
                    style: {
                      width: `${logoHeight * 0.4}px`,
                      height: `${logoHeight * 0.4}px`
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4 text-muted-foreground" })
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: alignClass(form.kopfzeileAdressePosition), children: form.kopfzeileAdresse ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-foreground whitespace-pre-line leading-tight", children: form.kopfzeileAdresse }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground text-sm", children: (company == null ? void 0 : company.name) || "Firmenname" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-[10px] leading-tight", children: (company == null ? void 0 : company.address) || "Firmenadresse" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground space-y-0.5", children: [
            form.bank && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Bank: ",
              form.bank
            ] }),
            form.iban && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "IBAN: ",
              form.iban
            ] }),
            form.mwstNummer && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "MwSt-Nr: ",
              form.mwstNummer
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-3 pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-sm", style: { color: accentColor }, children: [
        "Rechnung ",
        rechnungsNr
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-[10px]", children: [
        "Datum: ",
        todayDE()
      ] }),
      form.zahlungszielTage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-[10px]", children: [
        "Zahlungsziel: ",
        form.zahlungszielTage,
        " Tage"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "px-4",
        style: {
          paddingTop: `${form.kundenadresseAbstandOben || 10}px`,
          paddingBottom: `${form.kundenadresseAbstandNach || 10}px`,
          paddingLeft: einrueckung > 0 ? `${einrueckung * 0.55 + 1}rem` : void 0
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-primary/70 border border-dashed border-primary/30 rounded px-1.5 py-1 inline-block whitespace-pre-line leading-tight", children: fiktiveKundenadresse }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[8px] text-muted-foreground mt-0.5 italic", children: [
            "Kundenadresse · Abstand oben: ",
            form.kundenadresseAbstandOben,
            "px · Abstand nach: ",
            form.kundenadresseAbstandNach,
            "px"
          ] })
        ]
      }
    ),
    form.kopftext && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `px-4 pb-2 text-[10px] text-foreground whitespace-pre-line leading-relaxed border-b border-border ${alignClass(form.kopfzeilePosition)}`,
        children: form.kopftext
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-2 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-[9px] border-collapse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { backgroundColor: `${accentColor}18` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 px-1 font-semibold text-foreground", children: "Datum" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 px-1 font-semibold text-foreground", children: "Bezeichnung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 px-1 font-semibold text-foreground", children: "Menge" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 px-1 font-semibold text-foreground", children: "Einheit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 px-1 font-semibold text-foreground", children: "Preis CHF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 px-1 font-semibold text-foreground", children: "Total CHF" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
        {
          datum: "01.04.2026",
          bezeichnung: "Beratung, Kickoff-Meeting",
          menge: "08:00",
          einheit: "Std.",
          preis: "120.00",
          total: "960.00"
        },
        {
          datum: "02.04.2026",
          bezeichnung: "Entwicklung, Feature-Umsetzung",
          menge: "04:00",
          einheit: "Std.",
          preis: "150.00",
          total: "600.00"
        }
      ].map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "tr",
        {
          className: "border-b border-border/50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-0.5 px-1 text-muted-foreground", children: row.datum }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-0.5 px-1", children: row.bezeichnung }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-0.5 px-1 text-right tabular-nums", children: row.menge }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-0.5 px-1", children: row.einheit }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-0.5 px-1 text-right tabular-nums", children: row.preis }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-0.5 px-1 text-right font-semibold", children: row.total })
          ]
        },
        row.datum + row.bezeichnung
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { backgroundColor: `${accentColor}12` }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "td",
          {
            colSpan: 5,
            className: "py-1 px-1 text-right font-bold text-[10px]",
            children: "Total CHF"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 px-1 text-right font-bold text-[10px]", children: "1'560.00" })
      ] }) })
    ] }) }),
    (form.fusstext || form.fusszeileBildUrl) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border", children: fussNebeneinander ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 flex items-start gap-3", children: [
      form.fusstext && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `flex-1 text-[9px] text-muted-foreground whitespace-pre-line leading-relaxed ${alignClass(form.fusszeilePosition)}`,
          children: form.fusstext
        }
      ),
      form.fusszeileBildUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `flex ${flexAlignClass(form.fusszeileBildPosition)}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: form.fusszeileBildUrl,
              alt: "Fusszeile",
              className: "max-h-8 object-contain"
            }
          )
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 space-y-1.5", children: [
      form.fusstext && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `text-[9px] text-muted-foreground whitespace-pre-line leading-relaxed ${alignClass(form.fusszeilePosition)}`,
          children: form.fusstext
        }
      ),
      form.fusszeileBildUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `flex ${flexAlignClass(form.fusszeileBildPosition)}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: form.fusszeileBildUrl,
              alt: "Fusszeile",
              className: "max-h-8 object-contain"
            }
          )
        }
      )
    ] }) }),
    form.qrAktivStandard && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-4 mb-4 border border-border rounded overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-semibold text-muted-foreground px-2 pt-1.5 pb-1 bg-muted/30 border-b border-border", children: "QR-Rechnung / Zahlschein (Vorschau)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex text-[8px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-1/3 border-r border-border p-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-[9px]", children: "Empfangsschein" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Konto / Zahlbar an" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[8px]", children: form.qrIban || "CH56 0000 0000 0000 0000 0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: form.qrKontoinhaber || (company == null ? void 0 : company.name) || "Firmenname" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-muted-foreground", children: "Währung / Betrag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "CHF 1'560.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 p-2 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-[9px]", children: "Zahlteil" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 border border-border rounded flex items-center justify-center bg-muted/20 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-8 h-8 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Konto / Zahlbar an" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[8px]", children: form.qrIban || "CH56 0000 0000 0000 0000 0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: form.qrKontoinhaber || (company == null ? void 0 : company.name) || "Firmenname" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-muted-foreground", children: "Währung / Betrag" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "CHF 1'560.00" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function RechnungsvorlagenTab() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const { actor, isFetching } = useActor$1();
  const qc = useQueryClient();
  const [form, setForm] = reactExports.useState(DEFAULT_FORM);
  const [savedForm, setSavedForm] = reactExports.useState(DEFAULT_FORM);
  const { data: templateResult, isLoading: templateLoading } = useQuery({
    queryKey: ["invoiceTemplate"],
    queryFn: async () => {
      if (!actor) return null;
      const res = await actor.getInvoiceTemplate();
      if (res.__kind__ === "err") return null;
      return res.ok ?? null;
    },
    enabled: !!actor && !isFetching
  });
  const { data: company, isLoading: companyLoading } = useQuery(
    {
      queryKey: ["company"],
      queryFn: async () => {
        if (!actor) return null;
        const res = await actor.getMyCompany();
        if (res.__kind__ === "err") return null;
        return res.ok ?? null;
      },
      enabled: !!actor && !isFetching
    }
  );
  reactExports.useEffect(() => {
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
          String(form.kundenadresseAbstandOben)
        );
        localStorage.setItem(
          "rv_kundenadresse_einrueckung_zeichen",
          String(form.kundenadresseEinrueckungZeichen)
        );
        localStorage.setItem(
          "rv_kundenadresse_abstand_nach",
          String(form.kundenadresseAbstandNach)
        );
        localStorage.setItem("rv_mwst_satz_standard", String(form.mwstSatz));
      } catch {
      }
      const input = formToInput(form);
      const res = await actor.createOrUpdateInvoiceTemplate(input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["invoiceTemplate"] });
      if (updated) {
        const f = templateToForm(updated, company);
        setSavedForm(f);
      }
      ue.success("Rechnungsvorlage gespeichert");
    },
    onError: (e) => ue.error(e.message)
  });
  function handleReset() {
    setForm(savedForm);
  }
  const sf = (patch) => setForm((f) => ({ ...f, ...patch }));
  if (templateLoading || companyLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 w-full" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    !isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4 flex-shrink-0" }),
      "Nur Admins können die Vorlage bearbeiten."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionHeading,
            {
              number: 1,
              title: "Firmenlogo / Absenderbereich",
              description: "Logo und Firmenadresse im Rechnungskopf"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Logo-Quelle" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex rounded-md border border-input overflow-hidden", children: ["stammdaten", "upload"].map((src) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "label",
                {
                  className: `flex-1 px-3 py-1.5 text-xs transition-colors cursor-pointer text-center select-none flex items-center justify-center gap-1.5
                        ${!isAdmin ? "opacity-50 cursor-not-allowed" : ""}
                        ${form.kopfzeileLogoQuelle === src ? "bg-primary text-primary-foreground font-medium" : "bg-background text-muted-foreground hover:bg-muted"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "radio",
                        name: "rv-logo-quelle",
                        value: src,
                        checked: form.kopfzeileLogoQuelle === src,
                        disabled: !isAdmin,
                        onChange: () => isAdmin && sf({ kopfzeileLogoQuelle: src }),
                        className: "sr-only"
                      }
                    ),
                    src === "stammdaten" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3 h-3" }),
                    src === "stammdaten" ? "Aus Stammdaten" : "Eigenes Logo"
                  ]
                },
                src
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-logo-groesse", className: "text-xs", children: "Logo-Grösse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: form.kopfzeileLogoGroesse,
                  onValueChange: (v) => sf({ kopfzeileLogoGroesse: v }),
                  disabled: !isAdmin,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectTrigger,
                      {
                        id: "rv-logo-groesse",
                        "data-ocid": "rv-logo-groesse",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LOGO_GROESSE_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
                  ]
                }
              )
            ] }),
            form.kopfzeileLogoQuelle === "upload" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              ImageUploadField,
              {
                label: "Logo hochladen (JPG/PNG)",
                imageUrl: form.kopfzeileBildUrl,
                imagePosition: form.kopfzeileBildPosition,
                onImageChange: (url) => sf({ kopfzeileBildUrl: url }),
                onPositionChange: (pos) => sf({ kopfzeileBildPosition: pos }),
                onRemove: () => sf({ kopfzeileBildUrl: "" }),
                disabled: !isAdmin,
                ocidPrefix: "rv-kopf-logo"
              }
            ),
            form.kopfzeileLogoQuelle === "stammdaten" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 rounded bg-muted/30 border border-border", children: [
              (company == null ? void 0 : company.logoUrl) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: company.logoUrl,
                  alt: "Firmenlogo",
                  style: {
                    height: `${LOGO_GROESSE_HEIGHT[form.kopfzeileLogoGroesse] * 0.6}px`
                  },
                  className: "object-contain"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded bg-muted/50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Logo aus",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Stammdaten › Firma" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-foreground", children: "Firmenadresse im Kopf" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-kopf-adresse", className: "text-xs", children: "Adresstext" }),
                  company && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "h-6 text-xs px-2",
                      disabled: !isAdmin,
                      onClick: () => sf({
                        kopfzeileAdresse: `${company.name ?? ""}
${company.address ?? ""}`.trim()
                      }),
                      children: "Aus Stammdaten übernehmen"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Textarea,
                  {
                    id: "rv-kopf-adresse",
                    "data-ocid": "rv-kopf-adresse",
                    value: form.kopfzeileAdresse,
                    onChange: (e) => sf({ kopfzeileAdresse: e.target.value }),
                    rows: 4,
                    className: "resize-none text-sm",
                    placeholder: `${(company == null ? void 0 : company.name) ?? "Firmenname"}
Musterstrasse 1
8000 Zürich`,
                    disabled: !isAdmin
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Firma-Positionierung" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  PositionControl,
                  {
                    value: form.kopfzeileAdressePosition,
                    onChange: (v) => sf({ kopfzeileAdressePosition: v }),
                    disabled: !isAdmin,
                    id: "rv-kopf-adresse-position"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Layout Logo + Adresse" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  LayoutToggle,
                  {
                    value: form.kopfzeileLayout,
                    onChange: (v) => sf({ kopfzeileLayout: v }),
                    disabled: !isAdmin,
                    id: "rv-kopf-layout"
                  }
                )
              ] })
            ] }),
            form.kopfzeileLogoQuelle === "stammdaten" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-foreground", children: "Zusätzliches Kopfzeilen-Bild" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ImageUploadField,
                  {
                    label: "Bild (JPG/PNG)",
                    imageUrl: form.kopfzeileBildUrl,
                    imagePosition: form.kopfzeileBildPosition,
                    onImageChange: (url) => sf({ kopfzeileBildUrl: url }),
                    onPositionChange: (pos) => sf({ kopfzeileBildPosition: pos }),
                    onRemove: () => sf({ kopfzeileBildUrl: "" }),
                    disabled: !isAdmin,
                    ocidPrefix: "rv-kopf-bild"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionHeading,
            {
              number: 2,
              title: "Empfängerbereich / Kundenadresse",
              description: "Positionierung der Kundenadresse im Briefumschlag-Fenster"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-adresse-abstand", className: "text-xs", children: "Abstand vom oberen Rand (px)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rv-adresse-abstand",
                  "data-ocid": "rv-adresse-abstand",
                  type: "number",
                  min: 0,
                  max: 600,
                  step: 1,
                  value: form.kundenadresseAbstandOben,
                  onChange: (e) => sf({
                    kundenadresseAbstandOben: Number(e.target.value) || 0
                  }),
                  disabled: !isAdmin
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Vertikale Position in Pixeln (Fensterkuvert)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-adresse-einrueckung", className: "text-xs", children: "Einrückung links (px)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rv-adresse-einrueckung",
                  "data-ocid": "rv-adresse-einrueckung",
                  type: "number",
                  min: 0,
                  max: 400,
                  step: 1,
                  value: form.kundenadresseEinrueckungZeichen,
                  onChange: (e) => sf({
                    kundenadresseEinrueckungZeichen: Number(e.target.value) || 0
                  }),
                  disabled: !isAdmin
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Horizontale Einrückung in Pixeln" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-adresse-abstand-nach", className: "text-xs", children: "Abstand nach Kundenadresse bis nächsten Textblock (px)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rv-adresse-abstand-nach",
                  "data-ocid": "rv-adresse-abstand-nach",
                  type: "number",
                  min: 0,
                  max: 400,
                  step: 1,
                  value: form.kundenadresseAbstandNach,
                  onChange: (e) => sf({
                    kundenadresseAbstandNach: Number(e.target.value) || 0
                  }),
                  disabled: !isAdmin,
                  className: "w-32"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Leerraum in Pixeln zwischen Kundenadresse und Betreff/Rechnungstitel." })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionHeading,
            {
              number: 3,
              title: "Rechnungskopf",
              description: "Nummerierung, Datum und Zahlungskonditionen"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-praefix", children: "Präfix" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rv-praefix",
                  "data-ocid": "rv-praefix",
                  value: form.praefix,
                  onChange: (e) => sf({ praefix: e.target.value }),
                  placeholder: "RE-",
                  disabled: !isAdmin
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-naechste", children: "Nächste Nr." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rv-naechste",
                  "data-ocid": "rv-naechste",
                  type: "number",
                  min: 1,
                  value: form.naechsteNummer,
                  onChange: (e) => sf({ naechsteNummer: e.target.value }),
                  disabled: !isAdmin
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-zahlungsziel", children: "Zahlungsziel (Tage)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rv-zahlungsziel",
                  "data-ocid": "rv-zahlungsziel",
                  type: "number",
                  min: 0,
                  value: form.zahlungszielTage,
                  onChange: (e) => sf({ zahlungszielTage: e.target.value }),
                  disabled: !isAdmin
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-farbe", children: "Akzentfarbe" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "color",
                    id: "rv-farbe",
                    "data-ocid": "rv-farbe",
                    value: form.farbe,
                    onChange: (e) => sf({ farbe: e.target.value }),
                    disabled: !isAdmin,
                    className: "w-9 h-9 rounded border border-input cursor-pointer p-0.5 bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: form.farbe,
                    onChange: (e) => sf({ farbe: e.target.value }),
                    placeholder: "#006066",
                    disabled: !isAdmin,
                    className: "w-28 font-mono text-sm"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionHeading,
            {
              number: 4,
              title: "Kopftext / Betreff",
              description: "Anrede und Einleitung nach der Kundenadresse"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "rv-kopftext",
                  "data-ocid": "rv-kopftext",
                  value: form.kopftext,
                  onChange: (e) => sf({ kopftext: e.target.value }),
                  rows: 4,
                  className: "resize-none text-sm",
                  disabled: !isAdmin
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PlaceholderChips, {})
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Text-Positionierung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                PositionControl,
                {
                  value: form.kopfzeilePosition,
                  onChange: (v) => sf({ kopfzeilePosition: v }),
                  disabled: !isAdmin,
                  id: "rv-kopfzeile-position"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionHeading,
            {
              number: 5,
              title: "Leistungen & Spesen",
              description: "Standardwerte für Rechnungspositionen"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "grid grid-cols-2 gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-mwst-satz", children: "Standard MwSt.-Satz (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "rv-mwst-satz",
                "data-ocid": "rv-mwst-satz",
                type: "number",
                min: 0,
                max: 100,
                step: 0.1,
                value: form.mwstSatz,
                onChange: (e) => sf({ mwstSatz: e.target.value }),
                placeholder: "8.1",
                disabled: !isAdmin,
                className: "w-32"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Wird beim Erstellen neuer Rechnungsentwürfe automatisch übernommen (pro Rechnung änderbar)." })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionHeading,
            {
              number: 6,
              title: "Fusstext",
              description: "Abschlusstext unter den Rechnungspositionen"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "rv-fusstext",
                  "data-ocid": "rv-fusstext",
                  value: form.fusstext,
                  onChange: (e) => sf({ fusstext: e.target.value }),
                  rows: 5,
                  className: "resize-none text-sm",
                  disabled: !isAdmin
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PlaceholderChips, {})
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Text-Positionierung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                PositionControl,
                {
                  value: form.fusszeilePosition,
                  onChange: (v) => sf({ fusszeilePosition: v }),
                  disabled: !isAdmin,
                  id: "rv-fusszeile-position"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-foreground", children: "Fusszeilen-Bild / Logo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ImageUploadField,
                {
                  label: "Bild (JPG/PNG)",
                  imageUrl: form.fusszeileBildUrl,
                  imagePosition: form.fusszeileBildPosition,
                  onImageChange: (url) => sf({ fusszeileBildUrl: url }),
                  onPositionChange: (pos) => sf({ fusszeileBildPosition: pos }),
                  onRemove: () => sf({ fusszeileBildUrl: "" }),
                  disabled: !isAdmin,
                  ocidPrefix: "rv-fuss-bild"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Layout Text + Bild" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                LayoutToggle,
                {
                  value: form.fusszeileLayout,
                  onChange: (v) => sf({ fusszeileLayout: v }),
                  disabled: !isAdmin,
                  id: "rv-fuss-layout"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionHeading,
            {
              number: 7,
              title: "Zahlungsdetails",
              description: "Bankverbindung und MwSt.-Nummer für Rechnungsfuss"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-bank", children: "Bank" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rv-bank",
                  "data-ocid": "rv-bank",
                  value: form.bank,
                  onChange: (e) => sf({ bank: e.target.value }),
                  placeholder: "Zürcher Kantonalbank",
                  disabled: !isAdmin
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-iban", children: "IBAN" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rv-iban",
                  "data-ocid": "rv-iban",
                  value: form.iban,
                  onChange: (e) => sf({ iban: e.target.value }),
                  placeholder: "CH56 0483 5012 3456 7800 9",
                  disabled: !isAdmin
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-mwst", children: "MwSt-Nummer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "rv-mwst",
                  "data-ocid": "rv-mwst",
                  value: form.mwstNummer,
                  onChange: (e) => sf({ mwstNummer: e.target.value }),
                  placeholder: "CHE-123.456.789 MWST",
                  disabled: !isAdmin
                }
              )
            ] }),
            company && (company.taxId || company.name || company.address) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 p-3 rounded-lg bg-muted/40 border border-border space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Aus Stammdaten.Firma" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "a",
                  {
                    href: "/stammdaten?tab=firma",
                    className: "inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" }),
                      "In Stammdaten bearbeiten"
                    ]
                  }
                )
              ] }),
              company.taxId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "MwSt-Nr.:" }),
                " ",
                company.taxId
              ] }),
              company.name && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Konto-Inhaber:" }),
                " ",
                company.name
              ] }),
              company.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Konto-Adresse:" }),
                " ",
                company.address
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground pt-0.5", children: "Diese Angaben werden aus den Firmenstammdaten übernommen und stehen als Platzhalter [konto_inhaber] und [konto_adresse] zur Verfügung." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SectionHeading,
            {
              number: 8,
              title: "QR-Zahlschein",
              description: "Schweizer QR-Rechnung nach SPS 2.0"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-qr-aktiv", className: "text-sm font-medium", children: "QR-Code standardmässig aktivieren" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Neue Rechnungen erhalten automatisch einen QR-Zahlschein." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  id: "rv-qr-aktiv",
                  "data-ocid": "rv-qr-aktiv",
                  checked: form.qrAktivStandard,
                  onCheckedChange: (v) => sf({ qrAktivStandard: v }),
                  disabled: !isAdmin
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-qr-iban", children: "IBAN" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "rv-qr-iban",
                    "data-ocid": "rv-qr-iban",
                    value: form.qrIban,
                    onChange: (e) => sf({ qrIban: e.target.value }),
                    placeholder: "CH56 0483 5012 3456 7800 9",
                    disabled: !isAdmin,
                    className: "font-mono text-sm"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-qr-kontoinhaber", children: "Kontoinhaber Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "rv-qr-kontoinhaber",
                    "data-ocid": "rv-qr-kontoinhaber",
                    value: form.qrKontoinhaber,
                    onChange: (e) => sf({ qrKontoinhaber: e.target.value }),
                    placeholder: "Muster AG",
                    disabled: !isAdmin
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "rv-qr-adresse", children: "Kontoinhaber Adresse" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "rv-qr-adresse",
                    "data-ocid": "rv-qr-adresse",
                    value: form.qrKontoinhaberAdresse,
                    onChange: (e) => sf({ qrKontoinhaberAdresse: e.target.value }),
                    placeholder: "Musterstrasse 1, 8000 Zürich",
                    disabled: !isAdmin
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Währung" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-muted/40 text-sm text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3.5 h-3.5 flex-shrink-0" }),
                  "CHF — fix (SPS 2.0)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Referenztyp" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-muted/40 text-sm text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3.5 h-3.5 flex-shrink-0" }),
                  "NON — fix"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Der QR-Zahlschein erscheint im PDF immer auf einer separaten Seite nach den Rechnungspositionen (Swiss Payment Standards 2.0). Währung und Referenztyp sind fix auf CHF / NON gesetzt." })
            ] })
          ] })
        ] }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 justify-end pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              "data-ocid": "rv-cancel",
              onClick: handleReset,
              disabled: saveMutation.isPending,
              children: "Abbrechen"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              "data-ocid": "rv-save",
              onClick: () => saveMutation.mutate(),
              disabled: saveMutation.isPending,
              children: saveMutation.isPending ? "Speichern..." : "Speichern"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-primary" }),
          "Vorschau"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(InvoicePreview, { form, company }) })
      ] })
    ] })
  ] });
}
const defaultForm = {
  name: "",
  billable: true,
  reimbursable: true,
  aktiv: true
};
function SpesenArtenTab() {
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useActor(createActor);
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm);
  const [nameError, setNameError] = reactExports.useState("");
  const { data: expenseTypes = [], isLoading } = useQuery({
    queryKey: ["expenseTypes"],
    queryFn: () => (actor == null ? void 0 : actor.listExpenseTypes()) ?? [],
    enabled: !!actor && !isFetching
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      if (editItem) {
        const res2 = await actor.updateExpenseType(editItem.id, {
          name: form.name,
          billable: form.billable,
          reimbursable: form.reimbursable,
          aktiv: form.aktiv
        });
        if (res2.__kind__ === "err") throw new Error(res2.err);
        return res2.ok;
      }
      const res = await actor.createExpenseType({
        name: form.name,
        billable: form.billable,
        reimbursable: form.reimbursable,
        aktiv: form.aktiv
      });
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenseTypes"] });
      ue.success(editItem ? "Spesenart aktualisiert" : "Spesenart erstellt");
      setDialogOpen(false);
    },
    onError: (e) => ue.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteExpenseType(id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenseTypes"] });
      ue.success("Spesenart gelöscht");
      setDeleteTarget(null);
    },
    onError: (e) => ue.error(e.message)
  });
  function openAdd() {
    setEditItem(null);
    setForm(defaultForm);
    setNameError("");
    setDialogOpen(true);
  }
  function openEdit(et) {
    setEditItem(et);
    setForm({
      name: et.name,
      billable: et.billable,
      reimbursable: et.reimbursable,
      aktiv: et.aktiv
    });
    setNameError("");
    setDialogOpen(true);
  }
  function handleSubmit() {
    if (!form.name.trim()) {
      setNameError("Pflichtfeld");
      return;
    }
    setNameError("");
    saveMutation.mutate();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        expenseTypes.length,
        " Spesenarten"
      ] }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "spesenarten-add",
          onClick: openAdd,
          size: "sm",
          className: "gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Spesenart hinzufügen"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Verrechenbar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Rückerstattbar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: expenseTypes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: canWrite ? 5 : 4,
          className: "text-center py-8 text-muted-foreground",
          children: "Keine Spesenarten vorhanden"
        }
      ) }) : expenseTypes.map((et) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { "data-ocid": "spesenarten-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: et.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: et.billable ? "Ja" : "Nein" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: et.reimbursable ? "Ja" : "Nein" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: et.aktiv ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100", children: "Aktiv" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Inaktiv" }) }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8",
              onClick: () => openEdit(et),
              "aria-label": "Bearbeiten",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 text-destructive hover:text-destructive",
              onClick: () => setDeleteTarget(et),
              "aria-label": "Löschen",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }) })
      ] }, String(et.id))) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Spesenart bearbeiten" : "Spesenart hinzufügen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "etname", children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "etname",
              "data-ocid": "spesenarten-name",
              value: form.name,
              onChange: (e) => setForm({ ...form, name: e.target.value })
            }
          ),
          nameError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: nameError })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "etbillable",
              "data-ocid": "spesenarten-billable",
              checked: form.billable,
              onCheckedChange: (v) => setForm({ ...form, billable: !!v })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "etbillable", children: "Verrechenbar" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "etreimbursable",
              "data-ocid": "spesenarten-reimbursable",
              checked: form.reimbursable,
              onCheckedChange: (v) => setForm({ ...form, reimbursable: !!v })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "etreimbursable", children: "Rückerstattbar" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "etaktiv",
              "data-ocid": "spesenarten-aktiv",
              checked: form.aktiv,
              onCheckedChange: (v) => setForm({ ...form, aktiv: !!v })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "etaktiv", children: [
            "Aktiv",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs font-normal text-muted-foreground mt-0.5", children: "Inaktive Spesenarten werden bei der Speseneingabe nicht angezeigt" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDialogOpen(false),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": "spesenarten-save",
            onClick: handleSubmit,
            disabled: saveMutation.isPending,
            children: saveMutation.isPending ? "Speichern..." : "Speichern"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!deleteTarget, onOpenChange: () => setDeleteTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Spesenart löschen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Möchten Sie ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget == null ? void 0 : deleteTarget.name }),
        " wirklich löschen?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => setDeleteTarget(null),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "destructive",
            "data-ocid": "spesenarten-delete-confirm",
            onClick: () => deleteTarget && deleteMutation.mutate(deleteTarget.id),
            disabled: deleteMutation.isPending,
            children: "Löschen"
          }
        )
      ] })
    ] }) })
  ] });
}
const TAB_LABELS = {
  firma: "Firma",
  mitarbeiter: "Mitarbeiter",
  kunden: "Kunden",
  projekte: "Projekte",
  leistungsarten: "Leistungsarten",
  spesenarten: "Spesenarten",
  abwesenheitsarten: "Abwesenheitsarten",
  feiertage: "Feiertage",
  rechnungsvorlagen: "Rechnungsvorlagen"
};
const VALID_TABS = [
  "firma",
  "mitarbeiter",
  "kunden",
  "projekte",
  "leistungsarten",
  "spesenarten",
  "abwesenheitsarten",
  "feiertage",
  "rechnungsvorlagen"
];
function StammdatenPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId } = useAuth();
  const { tab } = useSearch({ from: "/stammdaten" });
  reactExports.useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);
  const activeTab = VALID_TABS.includes(tab) ? tab : "mitarbeiter";
  const activeLabel = TAB_LABELS[activeTab];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-display font-bold text-foreground", children: [
        "Stammdaten — ",
        activeLabel
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Verwaltung der Stammdaten für Ihr Unternehmen" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "stammdaten-content", children: [
      activeTab === "firma" && /* @__PURE__ */ jsxRuntimeExports.jsx(FirmaTab, {}),
      activeTab === "mitarbeiter" && /* @__PURE__ */ jsxRuntimeExports.jsx(MitarbeiterTab, {}),
      activeTab === "kunden" && /* @__PURE__ */ jsxRuntimeExports.jsx(KundenTab, {}),
      activeTab === "projekte" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProjekteTab, {}),
      activeTab === "leistungsarten" && /* @__PURE__ */ jsxRuntimeExports.jsx(LeistungsArtenTab, {}),
      activeTab === "spesenarten" && /* @__PURE__ */ jsxRuntimeExports.jsx(SpesenArtenTab, {}),
      activeTab === "abwesenheitsarten" && /* @__PURE__ */ jsxRuntimeExports.jsx(AbsenceTypenTab, {}),
      activeTab === "feiertage" && /* @__PURE__ */ jsxRuntimeExports.jsx(FeiertageTab, {}),
      activeTab === "rechnungsvorlagen" && /* @__PURE__ */ jsxRuntimeExports.jsx(RechnungsvorlagenTab, {})
    ] }, activeTab)
  ] }) });
}
export {
  StammdatenPage as default
};
