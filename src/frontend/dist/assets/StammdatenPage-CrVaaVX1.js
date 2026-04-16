import { e as useQueryClient, r as reactExports, j as jsxRuntimeExports, S as Skeleton, c as cn, a as useNavigate, f as useSearch } from "./index-CzAnGejr.js";
import { D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, j as Checkbox, k as DialogFooter, B as Building2, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, K as KundeZeiterfassungsart, q as Root, W as WarningProvider, r as Content, s as Title, v as Description, w as Close, x as createDialogScope, P as Portal, O as Overlay, y as Trigger, F as FeiertagsberechnungsartType, n as normalizeTimeInput, V as Variant_gutschrift_reduktion, E as Erfassungsart, z as Separator, L as Layout } from "./Layout-B1HD-_-K.js";
import { a as useAuth } from "./useAuthStore-Ba33VUEX.js";
import { P as Pencil, T as Trash2, D as DeleteConfirmDialog } from "./DeleteConfirmDialog-BE0ulj3u.js";
import { B as Badge } from "./badge-CGQZCl2g.js";
import { B as Button, b as buttonVariants } from "./button-De0KTRQr.js";
import { u as ue, L as Label, I as Input } from "./index-DYrEdX2e.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-QeoAc5uB.js";
import { a as useActor, b as useQuery, c as createActor, u as useComposedRefs } from "./backend-BNIvB4__.js";
import { u as useMutation } from "./useMutation-DIWQ28Sn.js";
import { P as Plus } from "./plus-CMRSc5rj.js";
import { L as Lock } from "./lock-BD9h-asg.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-RwdUJxIK.js";
import { c as createLucideIcon } from "./createLucideIcon-B_8OnPXI.js";
import { G as Globe, c as composeEventHandlers, m as createSlottable, d as createContextScope, k as Clock, i as Check } from "./users-BqWALrTR.js";
import { S as Save, a as Switch } from "./switch-B8-2RgTw.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CbGp-Z-Q.js";
import { T as Textarea } from "./textarea-8LoX23cl.js";
import { u as useActor$1, t as timestampToDate, d as dateToTimestamp, h as hhmmToMinutes, b as bigintToHhMm, a as hhhmmToMinutes, c as minutesToHhhMm, p as parseVacationDays, f as formatVacationDays, g as getRoleLabel } from "./shared-hFaAQd4g.js";
import { A as ArrowLeft } from "./arrow-left-BWdILwBL.js";
import { f as formatDateDE$1 } from "./dateFormat-CjU5zGrG.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$5);
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
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode$3);
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
  aktiv: true
};
function isSystemFerien(at) {
  return at.name.toLowerCase() === "ferien" || at.requiresApproval === true && at.compensated === true;
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
        const updatePayload = isEditingFerien ? {
          name: editItem.name,
          // keep locked
          requiresApproval: form.requiresApproval,
          // only user-editable field
          compensated: editItem.compensated,
          // keep locked
          aktiv: editItem.aktiv
          // keep locked
        } : {
          name: form.name,
          requiresApproval: form.requiresApproval,
          compensated: form.compensated,
          aktiv: form.aktiv
        };
        const res2 = await toAny$2(actor).updateAbsenceType(
          editItem.id,
          updatePayload
        );
        if (res2.__kind__ === "err") throw new Error(res2.err ?? "Fehler");
        return res2.ok;
      }
      const res = await toAny$2(actor).createAbsenceType({
        name: form.name,
        requiresApproval: form.requiresApproval,
        compensated: form.compensated,
        aktiv: form.aktiv
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
    setEditItem(at);
    setForm({
      name: at.name,
      requiresApproval: at.requiresApproval,
      compensated: at.compensated,
      aktiv: at.aktiv
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Genehmigung erforderlich" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Entschädigt (Arbeitszeit)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
        canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: absenceTypes.filter((at) => !isSystemFerien(at)).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TableCell,
        {
          colSpan: canWrite ? 5 : 4,
          className: "text-center py-8 text-muted-foreground",
          children: "Keine Abwesenheitsarten vorhanden"
        }
      ) }) : absenceTypes.filter((at) => !isSystemFerien(at)).map((at) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          "data-ocid": "abwesenheitsarten-row",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: at.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: at.requiresApproval ? "Ja" : "Nein" }),
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
              id: "atapproval",
              "data-ocid": "abwesenheitsarten-approval",
              checked: form.requiresApproval,
              onCheckedChange: (v) => setForm({ ...form, requiresApproval: !!v })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "atapproval", children: "Genehmigung erforderlich" })
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
      if (editItem) {
        const res2 = await actor.updateHoliday(editItem.id, {
          name: form.name,
          date: form.date,
          ganztaegig: form.ganztaegig
        });
        if (res2.__kind__ === "err") throw new Error(res2.err);
        return res2.ok;
      }
      const res = await actor.createHoliday({
        name: form.name,
        date: form.date,
        ganztaegig: form.ganztaegig
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
  zeiterfassungsart: KundeZeiterfassungsart.stuendlich,
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
    zeiterfassungsart: c.zeiterfassungsart ?? KundeZeiterfassungsart.stuendlich,
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
        zeiterfassungsart: form.zeiterfassungsart,
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Zeiterfassung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: customers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableCell,
          {
            colSpan: canWrite ? 5 : 4,
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-muted-foreground text-sm", children: c.zeiterfassungsart === KundeZeiterfassungsart.block ? "Block" : "Stündlich" }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ke-zeiterfassung", children: "Zeiterfassungsart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.zeiterfassungsart,
                onValueChange: (v) => sf("zeiterfassungsart", v),
                disabled: !canWrite,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      id: "ke-zeiterfassung",
                      "data-ocid": "kunden-zeiterfassungsart",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: KundeZeiterfassungsart.stuendlich, children: "Stündlich" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: KundeZeiterfassungsart.block, children: "Block (Von / Bis)" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
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
          ] })
        ] }),
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
  feiertagsberechnungsart: FeiertagsberechnungsartType.exakt,
  pensum: "100",
  stundenMo: "08:24",
  stundenDi: "08:24",
  stundenMi: "08:24",
  stundenDo: "08:24",
  stundenFr: "08:24",
  stundenSa: "00:00",
  stundenSo: "00:00"
};
function employmentToForm(e) {
  return {
    funktion: e.funktion,
    von: timestampToDate(e.von),
    bis: e.bis ? timestampToDate(e.bis) : "",
    feiertagsberechnungsart: e.feiertagsberechnungsart,
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
function formToInput(f) {
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
const FEIERTAGS_OPTIONS = [
  { value: FeiertagsberechnungsartType.exakt, label: "Exakt" },
  { value: FeiertagsberechnungsartType.prozentual, label: "Prozentual" },
  { value: FeiertagsberechnungsartType.entschaedigt, label: "Entschädigt" },
  {
    value: FeiertagsberechnungsartType.exaktWochentag,
    label: "Exakt Wochentag"
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
  const [pendingSave, setPendingSave] = reactExports.useState(false);
  const queryKey = ["employments", String(employeeId)];
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
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const input = formToInput(form);
      if (editItem) {
        const upd = input;
        const res2 = await actor.updateEmployment(employeeId, editItem.id, upd);
        if (res2.__kind__ === "err") throw new Error(res2.err);
        return res2.ok;
      }
      const res = await actor.createEmployment(employeeId, input);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      ue.success(
        editItem ? "Beschäftigung aktualisiert" : "Beschäftigung hinzugefügt"
      );
      setDialogOpen(false);
      setPendingSave(false);
    },
    onError: (e) => {
      ue.error(e.message);
      setPendingSave(false);
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
    return null;
  }
  function handleSaveClick() {
    const err = validate();
    if (err) {
      ue.error(err);
      return;
    }
    if (editItem) {
      setPendingSave(true);
      setShowWarning(true);
    } else {
      saveMutation.mutate();
    }
  }
  function handleWarningConfirm() {
    setShowWarning(false);
    if (pendingSave) saveMutation.mutate();
  }
  function openAdd() {
    setEditItem(null);
    setForm(defaultEmploymentForm);
    setDialogOpen(true);
  }
  function openEdit(emp) {
    setEditItem(emp);
    setForm(employmentToForm(emp));
    setDialogOpen(true);
  }
  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Beschäftigung bearbeiten" : "Beschäftigung hinzufügen" }) }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
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
            )
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
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: showWarning, onOpenChange: setShowWarning, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
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
              setPendingSave(false);
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
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm$4);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const correctionQueryKey = ["timeBalanceCorrections", String(employeeId)];
  const balanceQueryKey = ["timeBalance", String(employeeId)];
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
  const { data: timeBalance } = useQuery({
    queryKey: balanceQueryKey,
    queryFn: async () => {
      if (!actor) return null;
      const res = await actor.getTimeBalance(employeeId);
      if (res.__kind__ === "err") return null;
      return res.ok;
    },
    enabled: !!actor && !isFetching
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
      qc.invalidateQueries({ queryKey: balanceQueryKey });
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
      qc.invalidateQueries({ queryKey: balanceQueryKey });
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
  const balanceMinutes = timeBalance ? Number(timeBalance) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-border p-4 bg-muted/20 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-primary shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Aktueller Zeitsaldo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold font-mono", children: balanceMinutes === null ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-24 inline-block" }) : minutesToHhhMm(balanceMinutes) })
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
  onBack,
  onUpdated
}) {
  const { actor } = useTypedActor$1();
  const qc = useQueryClient();
  const [personalForm, setPersonalForm] = reactExports.useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    role: employee.role,
    geburtsdatum: bigintToDateStr(employee.geburtsdatum),
    adresseZusatz1: employee.adresseZusatz1 ?? "",
    adresseZusatz2: employee.adresseZusatz2 ?? "",
    strasse: employee.strasse ?? "",
    postfach: employee.postfach ?? "",
    plz: employee.plz ?? "",
    ort: employee.ort ?? "",
    land: employee.land ?? ""
  });
  const updatePersonalMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const input = {
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        email: personalForm.email,
        role: personalForm.role,
        geburtsdatum: dateStrToBigint(personalForm.geburtsdatum),
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
      ue.success("Persönliche Daten gespeichert");
      onUpdated(updated);
    },
    onError: (e) => ue.error(e.message)
  });
  const toggleActiveMutation = useMutation({
    mutationFn: async (active) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.updateEmployee(employee.id, { active });
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      ue.success(
        updated.active ? "Mitarbeiter aktiviert" : "Mitarbeiter deaktiviert"
      );
      onUpdated(updated);
    },
    onError: (e) => ue.error(e.message)
  });
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
            "Zurück"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold truncate", children: [
          employee.firstName,
          " ",
          employee.lastName
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: employee.active ? "default" : "secondary", children: employee.active ? "Aktiv" : "Inaktiv" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "personal", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap h-auto gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "personal", "data-ocid": "tab-personal", children: "Persönliche Daten" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "anstellung", "data-ocid": "tab-anstellung", children: "Anstellung / Beschäftigung" }),
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
        ) })
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: employee.active ? "Aktiv" : "Inaktiv" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: employee.active ? "Der Mitarbeiter ist aktiv und kann das System nutzen." : "Der Mitarbeiter ist inaktiv und hat keinen Zugang zum System." })
          ] }),
          canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: employee.active,
              onCheckedChange: (checked) => toggleActiveMutation.mutate(checked),
              disabled: toggleActiveMutation.isPending,
              "data-ocid": "mitarbeiter-status-toggle"
            }
          )
        ] })
      ] }) })
    ] })
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
  const { role } = useAuth();
  const canWrite = role === "admin" || role === "manager";
  const { actor, isFetching } = useTypedActor();
  const qc = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = reactExports.useState(false);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm$2);
  const [errors, setErrors] = reactExports.useState({});
  const [detailEmployee, setDetailEmployee] = reactExports.useState(null);
  const [inviteDialog, setInviteDialog] = reactExports.useState({
    open: false,
    employeeName: "",
    url: "",
    copied: false
  });
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
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Kein Actor");
      const input = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
        employmentType: form.employmentType,
        startDate: form.startDate,
        weeklyHoursTarget: 0
      };
      const res = await actor.createEmployee(input);
      if (res.__kind__ === "err") throw new Error(res.err);
      const newEmployee = res.ok;
      try {
        const [projects, serviceTypes] = await Promise.all([
          actor.listProjects(),
          actor.listServiceTypes()
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
          const membersRes = await actor.getProjectMembers(internProject.id);
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
            await actor.setProjectMembers(internProject.id, updatedMembers);
          }
        }
      } catch {
      }
      return newEmployee;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      ue.success("Mitarbeiter erstellt");
      setAddDialogOpen(false);
      setForm(defaultForm$2);
    },
    onError: (e) => ue.error(e.message)
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Kein Actor");
      const res = await actor.deleteEmployee(id);
      if (res.__kind__ === "err") throw new Error(res.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      ue.success("Mitarbeiter gelöscht");
      setDeleteTarget(null);
    },
    onError: (e) => ue.error(e.message)
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
      ue.error("Kopieren fehlgeschlagen – bitte manuell kopieren");
    }
  }
  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Pflichtfeld";
    if (!form.lastName.trim()) errs.lastName = "Pflichtfeld";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Gültige E-Mail erforderlich";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }
  function openAdd() {
    setForm(defaultForm$2);
    setErrors({});
    setAddDialogOpen(true);
  }
  if (detailEmployee) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      MitarbeiterDetail,
      {
        employee: detailEmployee,
        canWrite,
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
            "Mitarbeiter hinzufügen"
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
                      onClick: () => setDeleteTarget(emp),
                      "aria-label": "Löschen",
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Mitarbeiter hinzufügen" }) }),
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
            onClick: () => {
              if (validate()) createMutation.mutate();
            },
            disabled: createMutation.isPending,
            children: createMutation.isPending ? "Speichern..." : "Speichern"
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
            "Einladungslink für ",
            inviteDialog.employeeName
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Kopieren Sie den folgenden Link und senden Sie ihn an den Mitarbeiter. Der Link ist einmalig gültig und kann nur einmal verwendet werden." }),
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
            inviteDialog.copied && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-primary font-medium", children: "✓ Link wurde in die Zwischenablage kopiert" })
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
  stundensatz: 0
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
  erfassungsart: "dauer"
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
      const baseInput = {
        code: form.code,
        kurzbezeichnung: form.kurzbezeichnung,
        name: form.name,
        customerId: BigInt(form.customerId),
        projektleiter: form.projektleiter ? BigInt(form.projektleiter) : void 0,
        status: form.status,
        billableRate: form.billableRate,
        active: form.active,
        erfassungsart: form.erfassungsart === "zeitBlock" ? Erfassungsart.zeitBlock : Erfassungsart.dauer
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
        stundensatz: m.stundensatz
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
      erfassungsart: p.erfassungsart === Erfassungsart.zeitBlock ? "zeitBlock" : "dauer"
    });
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
              _key: ++_memberKeyCounter
            }))
          );
        } else {
          setMembers([]);
        }
      } catch {
        setMembers([]);
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prate", children: "Standard-Stundensatz (CHF)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "prate",
                type: "number",
                min: 0,
                step: 0.01,
                "data-ocid": "projekte-rate",
                value: form.billableRate,
                onChange: (e) => setForm({ ...form, billableRate: Number(e.target.value) })
              }
            )
          ] })
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
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-32 text-right", children: "Stundensatz (CHF)" }),
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
                  onValueChange: (v) => updateMember(i, { serviceTypeId: v }),
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
  feiertage: "Feiertage"
};
const VALID_TABS = [
  "firma",
  "mitarbeiter",
  "kunden",
  "projekte",
  "leistungsarten",
  "spesenarten",
  "abwesenheitsarten",
  "feiertage"
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
      activeTab === "feiertage" && /* @__PURE__ */ jsxRuntimeExports.jsx(FeiertageTab, {})
    ] }, activeTab)
  ] }) });
}
export {
  StammdatenPage as default
};
