import { a as useNavigate, e as useQueryClient, r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-CzAnGejr.js";
import { P as Pencil, T as Trash2, D as DeleteConfirmDialog } from "./DeleteConfirmDialog-BE0ulj3u.js";
import { L as Layout, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, R as RefreshCw, D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, X, k as DialogFooter } from "./Layout-B1HD-_-K.js";
import { B as Badge } from "./badge-CGQZCl2g.js";
import { B as Button } from "./button-De0KTRQr.js";
import { L as Label, I as Input, u as ue } from "./index-DYrEdX2e.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-QeoAc5uB.js";
import { T as Textarea } from "./textarea-8LoX23cl.js";
import { a as useAuth } from "./useAuthStore-Ba33VUEX.js";
import { a as useActor, b as useQuery, c as createActor } from "./backend-BNIvB4__.js";
import { u as useMutation } from "./useMutation-DIWQ28Sn.js";
import { P as Plus } from "./plus-CMRSc5rj.js";
import { c as createLucideIcon } from "./createLucideIcon-B_8OnPXI.js";
import { F as FileText } from "./users-BqWALrTR.js";
import { C as CircleCheckBig } from "./circle-check-big-JIu3-CFb.js";
import { C as CircleX } from "./circle-x-8IArerqk.js";
import { R as RotateCcw } from "./rotate-ccw-CAu1JDsU.js";
import { L as Lock } from "./lock-BD9h-asg.js";
import { D as Download } from "./download-Bujl23aH.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
const Image = createLucideIcon("image", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M13.234 20.252 21 12.3", key: "1cbrk9" }],
  [
    "path",
    {
      d: "m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486",
      key: "1pkts6"
    }
  ]
];
const Paperclip = createLucideIcon("paperclip", __iconNode);
const toAny = (a) => a;
const MAX_FILE_BYTES = 1.5 * 1024 * 1024;
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a;
      const result = (_a = e.target) == null ? void 0 : _a.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Datei konnte nicht gelesen werden."));
      }
    };
    reader.onerror = () => reject(new Error("Lesefehler beim Öffnen der Datei."));
    reader.readAsDataURL(file);
  });
}
function detectIsPdf(url) {
  return url.startsWith("data:application/pdf") || url.includes("application/pdf") || /\.pdf($|\?)/i.test(url);
}
function detectIsImage(url) {
  return url.startsWith("data:image/") || /\.(jpg|jpeg|png|gif|webp|bmp)($|\?)/i.test(url);
}
function StatusBadge({ status }) {
  if (status === "approved")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100", children: "Genehmigt" });
  if (status === "rejected")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100", children: "Abgelehnt" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100", children: "Ausstehend" });
}
function formatCHF(value) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF"
  }).format(value);
}
function formatDate(dateStr) {
  if (!dateStr) return "–";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}
function ReceiptPreviewDialog({ dataUrl, open, onClose }) {
  const [objectError, setObjectError] = reactExports.useState(false);
  const isPdf = detectIsPdf(dataUrl);
  const isImage = detectIsImage(dataUrl);
  const isValidUrl = dataUrl.startsWith("data:") || dataUrl.startsWith("blob:") || dataUrl.startsWith("http");
  reactExports.useEffect(() => {
    setObjectError(false);
  }, [dataUrl]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Beleg-Vorschau" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[300px] bg-muted/30 rounded-lg p-4", children: !isValidUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-12 h-12 text-muted-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Beleg nicht verfügbar." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/70", children: "Der Beleg wurde möglicherweise nicht korrekt gespeichert." })
    ] }) : isPdf ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "iframe",
        {
          src: dataUrl,
          title: "PDF Beleg",
          className: "w-full rounded border border-border",
          style: { minHeight: "60vh", height: "60vh" },
          onError: () => setObjectError(true)
        }
      ),
      objectError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 py-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-14 h-14 text-primary/60" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "PDF kann nicht direkt angezeigt werden." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: dataUrl,
            download: "beleg.pdf",
            className: "inline-flex items-center gap-1.5 text-sm text-primary underline",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
              "PDF herunterladen"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: dataUrl,
          download: "beleg.pdf",
          className: "inline-flex items-center gap-1.5 text-sm text-primary underline self-start",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
            "PDF herunterladen"
          ]
        }
      )
    ] }) : isImage ? objectError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-12 h-12 text-muted-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Bild konnte nicht geladen werden." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: dataUrl,
        alt: "Beleg",
        className: "max-w-full max-h-[60vh] rounded object-contain",
        onError: () => setObjectError(true)
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-12 h-12 text-muted-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Unbekannter Dateityp – Download verfügbar." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: dataUrl,
          download: "beleg",
          className: "inline-flex items-center gap-1.5 text-sm text-primary underline",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
            "Herunterladen"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
      isValidUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: dataUrl,
          download: isPdf ? "beleg.pdf" : "beleg",
          className: "inline-flex items-center gap-1.5 text-sm text-primary underline self-center mr-auto",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
            isPdf ? "PDF herunterladen" : "Bild herunterladen"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Schliessen" })
    ] })
  ] }) });
}
function RejectionDialog({
  open,
  onClose,
  onConfirm,
  isLoading
}) {
  const [comment, setComment] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Spesen ablehnen" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Möchtest du diesen Speseneintrag ablehnen? Optional kannst du einen Kommentar hinzufügen." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reject-comment", children: "Kommentar (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "reject-comment",
            value: comment,
            onChange: (e) => setComment(e.target.value),
            placeholder: "Begründung der Ablehnung…",
            rows: 3
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: onClose,
          disabled: isLoading,
          children: "Abbrechen"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "destructive",
          onClick: () => onConfirm(comment.trim() || null),
          disabled: isLoading,
          "data-ocid": "reject.confirm_button",
          children: isLoading ? "Wird abgelehnt…" : "Ablehnen"
        }
      )
    ] })
  ] }) });
}
function ResetDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  title
}) {
  const [reason, setReason] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Begründung ist erforderlich");
      return;
    }
    onConfirm(reason.trim());
  };
  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && handleClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", "data-ocid": "reset.dialog", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Der Status wird auf «Ausstehend» zurückgesetzt. Bitte eine Begründung angeben." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "reset-reason", children: [
          "Begründung ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "reset-reason",
            value: reason,
            onChange: (e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError("");
            },
            placeholder: "Begründung für das Zurücksetzen…",
            rows: 3,
            "data-ocid": "reset.textarea"
          }
        ),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: error })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: handleClose,
          disabled: isLoading,
          "data-ocid": "reset.cancel_button",
          children: "Abbrechen"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          onClick: handleConfirm,
          disabled: isLoading,
          "data-ocid": "reset.confirm_button",
          children: isLoading ? "Wird zurückgesetzt…" : "Zurücksetzen"
        }
      )
    ] })
  ] }) });
}
function ExpenseFormDialog({
  open,
  onClose,
  expenseTypes,
  onSubmit,
  isLoading,
  editExpense,
  title
}) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const [form, setForm] = reactExports.useState({
    date: today,
    expenseTypeId: "",
    billableCHF: 0,
    reimbursementCHF: 0,
    description: ""
  });
  const [file, setFile] = reactExports.useState(null);
  const [fileDataUrl, setFileDataUrl] = reactExports.useState(null);
  const [filePreview, setFilePreview] = reactExports.useState(null);
  const [fileSizeWarning, setFileSizeWarning] = reactExports.useState("");
  const [errors, setErrors] = reactExports.useState({});
  const fileRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!open) return;
    if (editExpense) {
      setForm({
        date: editExpense.date,
        expenseTypeId: String(editExpense.expenseTypeId),
        billableCHF: editExpense.billableCHF,
        reimbursementCHF: editExpense.reimbursementCHF,
        description: editExpense.description ?? ""
      });
      setFile(null);
      setFileDataUrl(null);
      setFilePreview(null);
      setFileSizeWarning("");
    } else {
      setForm({
        date: today,
        expenseTypeId: "",
        billableCHF: 0,
        reimbursementCHF: 0,
        description: ""
      });
      setFile(null);
      setFileDataUrl(null);
      setFilePreview(null);
      setFileSizeWarning("");
    }
    setErrors({});
  }, [open, editExpense, today]);
  const resetForm = () => {
    setForm({
      date: today,
      expenseTypeId: "",
      billableCHF: 0,
      reimbursementCHF: 0,
      description: ""
    });
    setFile(null);
    setFileDataUrl(null);
    setFilePreview(null);
    setFileSizeWarning("");
    setErrors({});
  };
  const handleClose = () => {
    resetForm();
    onClose();
  };
  const handleFile = async (e) => {
    var _a;
    const f = ((_a = e.target.files) == null ? void 0 : _a[0]) ?? null;
    setFile(f);
    setFileSizeWarning("");
    setFileDataUrl(null);
    if (!f) {
      setFilePreview(null);
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setFileSizeWarning(
        `Datei zu gross (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximal 1.5 MB erlaubt.`
      );
      setFile(null);
      setFileDataUrl(null);
      setFilePreview(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(f);
      setFileDataUrl(dataUrl);
      if (detectIsImage(f.name)) {
        setFilePreview(dataUrl);
      } else {
        setFilePreview(null);
      }
    } catch {
      setFileSizeWarning(
        "Datei konnte nicht gelesen werden. Bitte erneut versuchen."
      );
      setFile(null);
      setFileDataUrl(null);
      setFilePreview(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const validate = () => {
    const errs = {};
    if (!form.date) errs.date = "Datum ist erforderlich";
    if (!form.expenseTypeId) errs.expenseTypeId = "Spesenart ist erforderlich";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form, file, fileDataUrl);
    handleClose();
  };
  const dialogTitle = title ?? (editExpense ? "Spesen bearbeiten" : "Neuer Speseneintrag");
  const hasExistingReceipt = !!((editExpense == null ? void 0 : editExpense.receiptBlobId) && !file);
  const existingIsPdf = hasExistingReceipt ? detectIsPdf(editExpense.receiptBlobId) : false;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && handleClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dialogTitle }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "expense-date", children: [
          "Datum ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "expense-date",
            type: "date",
            value: form.date,
            onChange: (e) => setForm((p) => ({ ...p, date: e.target.value })),
            "data-ocid": "expense.date_input"
          }
        ),
        errors.date && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.date })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "expense-type", children: [
          "Spesenart ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: form.expenseTypeId,
            onValueChange: (v) => setForm((p) => ({ ...p, expenseTypeId: v })),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "expense-type", "data-ocid": "expense.type_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Spesenart auswählen…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: expenseTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: t.name }, String(t.id))) })
            ]
          }
        ),
        errors.expenseTypeId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.expenseTypeId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "expense-billable", children: "Verrechenbar CHF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "expense-billable",
              type: "number",
              min: "0",
              step: "0.01",
              value: form.billableCHF,
              onChange: (e) => setForm((p) => ({
                ...p,
                billableCHF: Number.parseFloat(e.target.value) || 0
              })),
              "data-ocid": "expense.billable_input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "expense-reimburse", children: "Rückerstattung CHF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "expense-reimburse",
              type: "number",
              min: "0",
              step: "0.01",
              value: form.reimbursementCHF,
              onChange: (e) => setForm((p) => ({
                ...p,
                reimbursementCHF: Number.parseFloat(e.target.value) || 0
              })),
              "data-ocid": "expense.reimburse_input"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "expense-desc", children: "Beschreibung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "expense-desc",
            value: form.description,
            onChange: (e) => setForm((p) => ({ ...p, description: e.target.value })),
            placeholder: "Wofür wurden die Spesen aufgewendet? (optional)",
            rows: 3,
            "data-ocid": "expense.desc_input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Beleg hochladen" }),
        hasExistingReceipt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-md bg-muted/40 border border-border", children: [
          existingIsPdf ? /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-primary shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-4 h-4 text-primary shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            existingIsPdf ? "PDF-Beleg" : "Bild-Beleg",
            " vorhanden. Neues Dokument auswählen um zu ersetzen."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "w-full border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            onClick: () => {
              var _a;
              return (_a = fileRef.current) == null ? void 0 : _a.click();
            },
            "aria-label": "Beleg hochladen",
            "data-ocid": "expense.upload_button",
            children: file ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-foreground", children: [
                detectIsImage(file.name) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-4 h-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[200px]", children: file.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                  "(",
                  (file.size / 1024).toFixed(0),
                  " KB)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  onClick: (e) => {
                    e.stopPropagation();
                    setFile(null);
                    setFileDataUrl(null);
                    setFilePreview(null);
                    setFileSizeWarning("");
                    if (fileRef.current) fileRef.current.value = "";
                  },
                  "aria-label": "Beleg entfernen",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-6 h-6" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Datei auswählen oder hier ablegen" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "JPG, PNG oder PDF (max. 1.5 MB)" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileRef,
            type: "file",
            accept: ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf",
            className: "hidden",
            onChange: handleFile,
            "data-ocid": "expense.file_input"
          }
        ),
        fileSizeWarning && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: fileSizeWarning }),
        filePreview && detectIsImage((file == null ? void 0 : file.name) ?? "") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 rounded-lg overflow-hidden border border-border max-h-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: filePreview,
            alt: "Vorschau",
            className: "w-full h-40 object-contain bg-muted/20"
          }
        ) }),
        file && detectIsPdf(file.name) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md border border-border text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-primary shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "PDF ausgewählt: ",
            file.name,
            " – wird beim Speichern hochgeladen."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: handleClose,
            disabled: isLoading,
            "data-ocid": "expense.cancel_button",
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            disabled: isLoading,
            "data-ocid": "expense.submit_button",
            children: isLoading ? "Wird gespeichert…" : "Spesen speichern"
          }
        )
      ] })
    ] })
  ] }) });
}
function SpesenPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, role, employeeId } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const isAdminOrManager = role === "admin" || role === "manager";
  const isMitarbeiter = role !== "admin" && role !== "manager";
  const [dateFrom, setDateFrom] = reactExports.useState("");
  const [dateTo, setDateTo] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [employeeFilter, setEmployeeFilter] = reactExports.useState("all");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editExpense, setEditExpense] = reactExports.useState(null);
  const [receiptPreview, setReceiptPreview] = reactExports.useState(null);
  const [rejectExpenseId, setRejectExpenseId] = reactExports.useState(null);
  const [resetExpenseId, setResetExpenseId] = reactExports.useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);
  const buildFilter = () => {
    const filter = {};
    if (dateFrom) filter.dateFrom = dateFrom;
    if (dateTo) filter.dateTo = dateTo;
    if (statusFilter !== "all") filter.status = statusFilter;
    if (isAdminOrManager && employeeFilter !== "all")
      filter.employeeId = BigInt(employeeFilter);
    return filter;
  };
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: [
      "expenses",
      dateFrom,
      dateTo,
      statusFilter,
      employeeFilter,
      companyId
    ],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await toAny(actor).listExpenses(buildFilter());
        return result;
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!companyId,
    staleTime: 3e4
  });
  const { data: expenseTypes = [] } = useQuery({
    queryKey: ["expenseTypes", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await toAny(actor).listExpenseTypes();
        return result;
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!companyId,
    staleTime: 12e4
  });
  const activeExpenseTypes = expenseTypes.filter(
    (t) => t.aktiv && t.id != null && String(t.id) !== ""
  );
  const { data: employees = [] } = useQuery({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      if (!actor || !isAdminOrManager) return [];
      try {
        const result = await toAny(actor).listEmployees();
        return result;
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!companyId && isAdminOrManager,
    staleTime: 12e4
  });
  const createMutation = useMutation({
    mutationFn: async ({
      data,
      fileDataUrl
    }) => {
      if (!actor) throw new Error("Nicht verbunden");
      let receiptBlobId;
      if (fileDataUrl) {
        receiptBlobId = fileDataUrl;
      }
      const input = {
        date: data.date,
        description: data.description || "",
        billableCHF: data.billableCHF,
        reimbursementCHF: data.reimbursementCHF,
        expenseTypeId: BigInt(data.expenseTypeId),
        ...receiptBlobId !== void 0 ? { receiptBlobId } : {}
      };
      const result = await toAny(actor).createExpense(input);
      const res = result;
      if (res.__kind__ === "err")
        throw new Error(res.err ?? "Fehler beim Speichern");
    },
    onSuccess: () => {
      ue.success("Spesen erfolgreich gespeichert");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      fileDataUrl
    }) => {
      if (!actor) throw new Error("Nicht verbunden");
      let receiptBlobId;
      if (fileDataUrl) {
        receiptBlobId = fileDataUrl;
      }
      const input = {
        date: data.date,
        description: data.description || "",
        billableCHF: data.billableCHF,
        reimbursementCHF: data.reimbursementCHF,
        expenseTypeId: BigInt(data.expenseTypeId),
        ...receiptBlobId !== void 0 ? { receiptBlobId } : {}
      };
      const result = await toAny(actor).updateExpense(id, input);
      const res = result;
      if (res.__kind__ === "err")
        throw new Error(res.err ?? "Fehler beim Aktualisieren");
    },
    onSuccess: () => {
      ue.success("Spesen aktualisiert");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setEditExpense(null);
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
    }
  });
  const approveMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Nicht verbunden");
      const result = await toAny(actor).approveExpense(id);
      const res = result;
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      ue.success("Spesen genehmigt");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err) => ue.error(`Fehler: ${err.message}`)
  });
  const rejectMutation = useMutation({
    mutationFn: async ({
      id,
      comment
    }) => {
      if (!actor) throw new Error("Nicht verbunden");
      const result = await toAny(actor).rejectExpense(id, comment);
      const res = result;
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      ue.success("Spesen abgelehnt");
      setRejectExpenseId(null);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err) => ue.error(`Fehler: ${err.message}`)
  });
  const resetMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      if (!actor) throw new Error("Nicht verbunden");
      const result = await toAny(actor).resetExpenseToAusstehend(id, reason);
      const res = result;
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      ue.success("Spesen auf «Ausstehend» zurückgesetzt");
      setResetExpenseId(null);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
      setResetExpenseId(null);
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Nicht verbunden");
      const result = await toAny(actor).deleteExpense(id);
      const res = result;
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      ue.success("Spesen gelöscht");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err) => ue.error(`Fehler: ${err.message}`)
  });
  const getExpenseTypeName = (id) => {
    const found = expenseTypes.find((t) => t.id === id);
    return (found == null ? void 0 : found.name) ?? "–";
  };
  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : "–";
  };
  const handleSubmitExpense = async (data, _file, fileDataUrl) => {
    if (editExpense) {
      await updateMutation.mutateAsync({
        id: editExpense.id,
        data,
        fileDataUrl
      });
    } else {
      await createMutation.mutateAsync({ data, fileDataUrl });
    }
  };
  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
    setEmployeeFilter("all");
  };
  const isFormLoading = createMutation.isPending || updateMutation.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Layout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Spesen erfassen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Ausgaben und Spesen verwalten" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            onClick: () => {
              setEditExpense(null);
              setShowForm(true);
            },
            "data-ocid": "expense.primary_button",
            className: "shrink-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1.5" }),
              "Neuer Speseneintrag"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-lg p-4 space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Datum von" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: dateFrom,
              onChange: (e) => setDateFrom(e.target.value),
              "data-ocid": "filter.date_from_input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Datum bis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: dateTo,
              onChange: (e) => setDateTo(e.target.value),
              "data-ocid": "filter.date_to_input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: statusFilter,
              onValueChange: (v) => setStatusFilter(v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "filter.status_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Alle" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pending", children: "Ausstehend" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Genehmigt" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Abgelehnt" })
                ] })
              ]
            }
          )
        ] }),
        isAdminOrManager && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Mitarbeiter" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: employeeFilter,
              onValueChange: setEmployeeFilter,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "filter.employee_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Alle Mitarbeitenden" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "Alle Mitarbeitenden" }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 flex flex-col justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            onClick: resetFilters,
            className: "text-muted-foreground h-9",
            "data-ocid": "filter.reset_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 mr-1.5" }),
              "Zurücksetzen"
            ]
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-lg overflow-hidden", children: expensesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) }) : expenses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "py-16 flex flex-col items-center text-center gap-3",
          "data-ocid": "expenses.empty_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-6 h-6 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-foreground", children: "Keine Spesen gefunden" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: dateFrom || dateTo || statusFilter !== "all" || employeeFilter !== "all" ? "Keine Einträge für die gewählten Filter." : "Noch keine Spesen erfasst. Klicke auf «Neuer Speseneintrag»." })
            ] }),
            !dateFrom && !dateTo && statusFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                size: "sm",
                onClick: () => setShowForm(true),
                "data-ocid": "expenses.empty_state_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1.5" }),
                  "Neuer Speseneintrag"
                ]
              }
            )
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Datum" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Spesenart" }),
          isAdminOrManager && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Mitarbeiter" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Verrechenbar CHF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Rückerstattung CHF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Beschreibung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: "Beleg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: expenses.map((expense, idx) => {
          const isOwn = String(expense.employeeId) === String(employeeId);
          const isApproved = expense.status === "approved";
          const isPending = expense.status === "pending";
          const canEdit = isAdminOrManager || isOwn && !isApproved && isPending;
          const canDelete = isAdminOrManager || isOwn && !isApproved && isPending;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            TableRow,
            {
              "data-ocid": `expense.item.${idx + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-sm whitespace-nowrap", children: formatDate(expense.date) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: getExpenseTypeName(expense.expenseTypeId) }),
                isAdminOrManager && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: getEmployeeName(expense.employeeId) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-sm", children: expense.billableCHF > 0 ? formatCHF(expense.billableCHF) : "–" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-sm", children: expense.reimbursementCHF > 0 ? formatCHF(expense.reimbursementCHF) : "–" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm max-w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2", children: expense.description || "–" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: expense.receiptBlobId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "sm",
                    className: "text-primary hover:text-primary/80 p-1",
                    onClick: () => setReceiptPreview(expense.receiptBlobId),
                    "aria-label": "Beleg anzeigen",
                    "data-ocid": `expense.receipt_button.${idx + 1}`,
                    title: detectIsPdf(expense.receiptBlobId) ? "PDF-Beleg anzeigen" : "Bild-Beleg anzeigen",
                    children: detectIsPdf(expense.receiptBlobId) ? /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "w-4 h-4" })
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/40 text-xs", children: "–" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: expense.status }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                  isAdminOrManager && isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "sm",
                        className: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-1",
                        onClick: () => approveMutation.mutate(expense.id),
                        disabled: approveMutation.isPending,
                        "aria-label": "Spesen genehmigen",
                        "data-ocid": `expense.approve_button.${idx + 1}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "sm",
                        className: "text-red-600 hover:text-red-700 hover:bg-red-50 p-1",
                        onClick: () => setRejectExpenseId(expense.id),
                        "aria-label": "Spesen ablehnen",
                        "data-ocid": `expense.reject_button.${idx + 1}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4" })
                      }
                    )
                  ] }),
                  isAdminOrManager && isApproved && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "text-amber-600 hover:text-amber-700 hover:bg-amber-50 p-1",
                      onClick: () => setResetExpenseId(expense.id),
                      "aria-label": "Auf Ausstehend zurücksetzen",
                      title: "Auf Ausstehend zurücksetzen",
                      "data-ocid": `expense.reset_button.${idx + 1}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4" })
                    }
                  ),
                  canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "text-muted-foreground hover:text-foreground p-1",
                      onClick: () => {
                        setEditExpense(expense);
                        setShowForm(true);
                      },
                      "aria-label": "Spesen bearbeiten",
                      "data-ocid": `expense.edit_button.${idx + 1}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
                    }
                  ),
                  canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "text-destructive hover:text-destructive/80 p-1",
                      onClick: () => setDeleteConfirmId(expense.id),
                      "aria-label": "Spesen löschen",
                      "data-ocid": `expense.delete_button.${idx + 1}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                    }
                  ),
                  isMitarbeiter && isApproved && isOwn && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Lock,
                    {
                      className: "w-3.5 h-3.5 text-muted-foreground/50",
                      "aria-label": "Genehmigte Spesen können nicht bearbeitet werden"
                    }
                  )
                ] }) })
              ]
            },
            String(expense.id)
          );
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ExpenseFormDialog,
      {
        open: showForm,
        onClose: () => {
          setShowForm(false);
          setEditExpense(null);
        },
        expenseTypes: activeExpenseTypes,
        onSubmit: handleSubmitExpense,
        isLoading: isFormLoading,
        editExpense
      }
    ),
    receiptPreview && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReceiptPreviewDialog,
      {
        dataUrl: receiptPreview,
        open: !!receiptPreview,
        onClose: () => setReceiptPreview(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RejectionDialog,
      {
        open: !!rejectExpenseId,
        onClose: () => setRejectExpenseId(null),
        onConfirm: (comment) => {
          if (rejectExpenseId)
            rejectMutation.mutate({ id: rejectExpenseId, comment });
        },
        isLoading: rejectMutation.isPending
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ResetDialog,
      {
        open: !!resetExpenseId,
        onClose: () => setResetExpenseId(null),
        onConfirm: (reason) => {
          if (resetExpenseId)
            resetMutation.mutate({ id: resetExpenseId, reason });
        },
        isLoading: resetMutation.isPending,
        title: "Spesen zurücksetzen"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DeleteConfirmDialog,
      {
        open: !!deleteConfirmId,
        onConfirm: () => {
          if (deleteConfirmId !== null) {
            deleteMutation.mutate(deleteConfirmId);
          }
          setDeleteConfirmId(null);
        },
        onCancel: () => setDeleteConfirmId(null),
        isDeleting: deleteMutation.isPending
      }
    )
  ] });
}
export {
  SpesenPage as default
};
