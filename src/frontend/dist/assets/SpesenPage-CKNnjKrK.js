import { a as useNavigate, e as useQueryClient, r as reactExports, j as jsxRuntimeExports, S as Skeleton } from "./index-D_yjRFGt.js";
import { C as ClosedPeriodBanner } from "./ClosedPeriodBanner-Ng8VZ_AT.js";
import { D as DeleteConfirmDialog } from "./DeleteConfirmDialog-CO-H5i0R.js";
import { q as useMutation, L as Layout, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, R as RefreshCw, D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, k as DialogFooter } from "./Layout-BOoVnXJI.js";
import { B as Badge } from "./badge-BPk2SywW.js";
import { B as Button } from "./button-BXNzWYpr.js";
import { L as Label, I as Input, u as ue } from "./index-SoMYIp0N.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CXihOV-A.js";
import { T as Textarea } from "./textarea-DOcRjrEq.js";
import { d as useAuth, u as useActor, b as useQuery, c as createActor } from "./useAuthStore-RPelH0kd.js";
import { u as useGetPeriodStatus } from "./usePeriodClose-CQO8NlO9.js";
import { P as Plus } from "./plus-1FdrTAyc.js";
import { c as createLucideIcon } from "./createLucideIcon-C599ATMm.js";
import { F as FileText, X } from "./x-BHvIGru9.js";
import { C as CircleCheckBig } from "./circle-check-big-M4F681dK.js";
import { C as CircleX } from "./circle-x-CTQNE8RQ.js";
import { R as RotateCcw } from "./rotate-ccw-C6yEopyQ.js";
import { P as Pencil } from "./pencil-BbiFCrI_.js";
import { T as Trash2 } from "./trash-2-DpHAoxHy.js";
import { L as Lock } from "./lock-BD6_Ipmh.js";
import { I as Image } from "./image-C45ozPsA.js";
import { D as Download } from "./download-ueAGhbPX.js";
import "./index-HGa3Ynxo.js";
import "./loader-circle-DPIlcj_m.js";
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
  projects,
  customers,
  projectMembers,
  loggedInEmployeeId,
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
  const [selectedProjektId, setSelectedProjektId] = reactExports.useState(
    null
  );
  const [file, setFile] = reactExports.useState(null);
  const [fileDataUrl, setFileDataUrl] = reactExports.useState(null);
  const [filePreview, setFilePreview] = reactExports.useState(null);
  const [fileSizeWarning, setFileSizeWarning] = reactExports.useState("");
  const [errors, setErrors] = reactExports.useState({});
  const fileRef = reactExports.useRef(null);
  const selectedExpenseType = reactExports.useMemo(
    () => form.expenseTypeId ? expenseTypes.find((t) => String(t.id) === form.expenseTypeId) : void 0,
    [form.expenseTypeId, expenseTypes]
  );
  const showBillable = (selectedExpenseType == null ? void 0 : selectedExpenseType.billable) ?? true;
  const showReimbursable = (selectedExpenseType == null ? void 0 : selectedExpenseType.reimbursable) ?? true;
  const assignedProjects = reactExports.useMemo(() => {
    if (!loggedInEmployeeId) return [];
    return projects.filter((p) => {
      if (!p.active) return false;
      const members = projectMembers.get(String(p.id)) ?? [];
      return members.some(
        (m) => String(m.employeeId) === String(loggedInEmployeeId)
      );
    });
  }, [projects, projectMembers, loggedInEmployeeId]);
  const projektOptions = reactExports.useMemo(() => {
    return assignedProjects.map((p) => {
      const kunde = customers.find(
        (c) => String(c.id) === String(p.customerId)
      );
      const label = kunde ? `${kunde.name}.${p.name}` : p.name;
      return { value: Number(p.id), label };
    });
  }, [assignedProjects, customers]);
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
      setSelectedProjektId(
        editExpense.projektId != null ? Number(editExpense.projektId) : null
      );
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
      setSelectedProjektId(null);
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
    setSelectedProjektId(null);
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
    if (selectedProjektId == null)
      errs.projektId = "Kunde.Projekt ist erforderlich";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form, file, fileDataUrl, selectedProjektId);
    handleClose();
  };
  const dialogTitle = title ?? (editExpense ? "Spesen bearbeiten" : "Neuer Speseneintrag");
  const hasExistingReceipt = !!((editExpense == null ? void 0 : editExpense.receiptBlobId) && !file);
  const existingIsPdf = hasExistingReceipt ? detectIsPdf(editExpense.receiptBlobId) : false;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && handleClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dialogTitle }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "expense-projekt", children: [
          "Kunde.Projekt ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: selectedProjektId != null ? String(selectedProjektId) : "",
            onValueChange: (v) => setSelectedProjektId(v ? Number(v) : null),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectTrigger,
                {
                  id: "expense-projekt",
                  "data-ocid": "expense.projekt_select",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Kunde.Projekt auswählen…" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: projektOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(opt.value), children: opt.label }, opt.value)) })
            ]
          }
        ),
        errors.projektId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.projektId })
      ] }),
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
            onValueChange: (v) => {
              const expType = expenseTypes.find((t) => String(t.id) === v);
              setForm((p) => ({
                ...p,
                expenseTypeId: v,
                // Reset amounts when switching type if the field is hidden
                billableCHF: (expType == null ? void 0 : expType.billable) === false ? 0 : p.billableCHF,
                reimbursementCHF: (expType == null ? void 0 : expType.reimbursable) === false ? 0 : p.reimbursementCHF
              }));
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "expense-type", "data-ocid": "expense.type_select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Spesenart auswählen…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: expenseTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(t.id), children: t.name }, String(t.id))) })
            ]
          }
        ),
        errors.expenseTypeId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: errors.expenseTypeId })
      ] }),
      (showBillable || showReimbursable) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        showBillable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
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
        showReimbursable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
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
  const isMitarbeiter = role === "employee";
  const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const { data: periodCloseStatus } = useGetPeriodStatus(
    companyId ? BigInt(companyId) : void 0,
    employeeId ? BigInt(employeeId) : void 0,
    currentMonth,
    currentYear
  );
  const isPeriodClosed = (periodCloseStatus == null ? void 0 : periodCloseStatus.status) === "closed";
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
  const { data: allProjects = [] } = useQuery(
    {
      queryKey: ["projects", companyId],
      queryFn: async () => {
        if (!actor) return [];
        try {
          const result = await toAny(actor).listProjects();
          return result.filter(
            (p) => p.active
          );
        } catch {
          return [];
        }
      },
      enabled: !!actor && !isFetching && isAuthenticated && !!companyId,
      staleTime: 12e4
    }
  );
  const { data: allCustomers = [] } = useQuery({
    queryKey: ["customers", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await toAny(actor).listCustomers();
        return result;
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!companyId,
    staleTime: 12e4
  });
  const [projectMembers, setProjectMembers] = reactExports.useState(/* @__PURE__ */ new Map());
  reactExports.useEffect(() => {
    if (!actor || isFetching || allProjects.length === 0) return;
    const memberMap = /* @__PURE__ */ new Map();
    void Promise.all(
      allProjects.map(async (p) => {
        try {
          const res = await toAny(actor).getProjectMembers(p.id);
          if (res.__kind__ === "ok") memberMap.set(String(p.id), res.ok);
        } catch {
        }
      })
    ).then(() => setProjectMembers(new Map(memberMap)));
  }, [actor, isFetching, allProjects]);
  const createMutation = useMutation({
    mutationFn: async ({
      data,
      fileDataUrl,
      selectedProjektId
    }) => {
      if (!actor) throw new Error("Nicht verbunden");
      let receiptBlobId;
      if (fileDataUrl) {
        receiptBlobId = fileDataUrl;
      }
      const selProject = allProjects.find(
        (p) => Number(p.id) === selectedProjektId
      );
      const kundeId = selProject ? BigInt(selProject.customerId) : void 0;
      const projektId = selectedProjektId != null ? BigInt(selectedProjektId) : void 0;
      const input = {
        date: data.date,
        description: data.description || "",
        billableCHF: data.billableCHF,
        reimbursementCHF: data.reimbursementCHF,
        expenseTypeId: BigInt(data.expenseTypeId),
        ...receiptBlobId !== void 0 ? { receiptBlobId } : {},
        ...kundeId !== void 0 ? { kundeId } : {},
        ...projektId !== void 0 ? { projektId } : {}
      };
      const result = await toAny(actor).createExpense(input);
      const res = result;
      if ("err" in res) throw new Error(res.err ?? "Fehler beim Speichern");
    },
    onSuccess: () => {
      ue.success("Spesen erfolgreich gespeichert");
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
        refetchType: "active"
      });
      setShowForm(false);
    },
    onError: (err) => {
      ue.error(`Fehler: ${err.message}`);
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      fileDataUrl,
      selectedProjektId
    }) => {
      if (!actor) throw new Error("Nicht verbunden");
      let receiptBlobId;
      if (fileDataUrl) {
        receiptBlobId = fileDataUrl;
      }
      const selProject = allProjects.find(
        (p) => Number(p.id) === selectedProjektId
      );
      const kundeId = selProject ? BigInt(selProject.customerId) : void 0;
      const projektId = selectedProjektId != null ? BigInt(selectedProjektId) : void 0;
      const input = {
        date: data.date,
        description: data.description || "",
        billableCHF: data.billableCHF,
        reimbursementCHF: data.reimbursementCHF,
        expenseTypeId: BigInt(data.expenseTypeId),
        ...receiptBlobId !== void 0 ? { receiptBlobId } : {},
        ...kundeId !== void 0 ? { kundeId } : {},
        ...projektId !== void 0 ? { projektId } : {}
      };
      const result = await toAny(actor).updateExpense(id, input);
      const res = result;
      if ("err" in res) throw new Error(res.err ?? "Fehler beim Aktualisieren");
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
      if (isPeriodClosed) {
        ue.error(
          "Diese Periode ist abgeschlossen. Löschen ist nicht mehr möglich."
        );
        throw new Error("Periode abgeschlossen");
      }
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
  const handleSubmitExpense = async (data, _file, fileDataUrl, selectedProjektId) => {
    if (isPeriodClosed) {
      ue.error(
        "Diese Periode ist abgeschlossen. Änderungen sind nicht mehr möglich."
      );
      return;
    }
    if (editExpense) {
      await updateMutation.mutateAsync({
        id: editExpense.id,
        data,
        fileDataUrl,
        selectedProjektId
      });
    } else {
      await createMutation.mutateAsync({
        data,
        fileDataUrl,
        selectedProjektId
      });
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
            disabled: isPeriodClosed && isMitarbeiter,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1.5" }),
              "Neuer Speseneintrag"
            ]
          }
        )
      ] }),
      isPeriodClosed && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ClosedPeriodBanner,
        {
          closedAt: periodCloseStatus == null ? void 0 : periodCloseStatus.closedAt,
          canReopen: false
        }
      ),
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
                        if (isPeriodClosed) {
                          ue.error(
                            "Diese Periode ist abgeschlossen. Bearbeiten ist nicht mehr möglich."
                          );
                          return;
                        }
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
        projects: allProjects,
        customers: allCustomers,
        projectMembers,
        loggedInEmployeeId: employeeId ?? null,
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
