import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuthStore";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Download,
  FileText,
  ImageIcon,
  Lock,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import type {
  Employee,
  Expense,
  ExpenseFilter,
  ExpenseStatus,
  ExpenseType,
  ExpenseTypeId,
  UpdateExpenseInput,
} from "../backend.d";

// ─── Types ───────────────────────────────────────────────────────────────────

type AnyActor = Record<string, (...args: unknown[]) => Promise<unknown>>;
const toAny = (a: unknown): AnyActor => a as AnyActor;

type StatusFilter = "all" | "pending" | "approved" | "rejected";

interface ExpenseFormData {
  date: string;
  expenseTypeId: string;
  billableCHF: number;
  reimbursementCHF: number;
  description: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Max file size: 1.5 MB (to stay within canister message limits for base64) */
const MAX_FILE_BYTES = 1.5 * 1024 * 1024;

/**
 * Read a File as a base64 data URL.
 * Works for jpg/png/pdf — preserves the full MIME type in the data URI prefix.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Datei konnte nicht gelesen werden."));
      }
    };
    reader.onerror = () =>
      reject(new Error("Lesefehler beim Öffnen der Datei."));
    // readAsDataURL preserves MIME type (data:application/pdf;base64,... or data:image/jpeg;base64,...)
    reader.readAsDataURL(file);
  });
}

/** Detect PDF from data URL prefix or filename */
function detectIsPdf(url: string): boolean {
  return (
    url.startsWith("data:application/pdf") ||
    url.includes("application/pdf") ||
    /\.pdf($|\?)/i.test(url)
  );
}

/** Detect image from data URL prefix or filename */
function detectIsImage(url: string): boolean {
  return (
    url.startsWith("data:image/") ||
    /\.(jpg|jpeg|png|gif|webp|bmp)($|\?)/i.test(url)
  );
}

function StatusBadge({ status }: { status: ExpenseStatus }) {
  if (status === "approved")
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
        Genehmigt
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
        Abgelehnt
      </Badge>
    );
  return (
    <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
      Ausstehend
    </Badge>
  );
}

function formatCHF(value: number): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(value);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "–";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

// ─── Receipt Preview Dialog ───────────────────────────────────────────────────

interface ReceiptPreviewProps {
  dataUrl: string;
  open: boolean;
  onClose: () => void;
}

function ReceiptPreviewDialog({ dataUrl, open, onClose }: ReceiptPreviewProps) {
  const [objectError, setObjectError] = useState(false);

  const isPdf = detectIsPdf(dataUrl);
  const isImage = detectIsImage(dataUrl);
  const isValidUrl =
    dataUrl.startsWith("data:") ||
    dataUrl.startsWith("blob:") ||
    dataUrl.startsWith("http");

  // Reset error state when dataUrl changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on dataUrl change
  useEffect(() => {
    setObjectError(false);
  }, [dataUrl]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Beleg-Vorschau</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center min-h-[300px] bg-muted/30 rounded-lg p-4">
          {!isValidUrl ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                Beleg nicht verfügbar.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Der Beleg wurde möglicherweise nicht korrekt gespeichert.
              </p>
            </div>
          ) : isPdf ? (
            <div className="w-full flex flex-col gap-3">
              <iframe
                src={dataUrl}
                title="PDF Beleg"
                className="w-full rounded border border-border"
                style={{ minHeight: "60vh", height: "60vh" }}
                onError={() => setObjectError(true)}
              />
              {objectError && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <FileText className="w-14 h-14 text-primary/60" />
                  <p className="text-sm font-medium">
                    PDF kann nicht direkt angezeigt werden.
                  </p>
                  <a
                    href={dataUrl}
                    download="beleg.pdf"
                    className="inline-flex items-center gap-1.5 text-sm text-primary underline"
                  >
                    <Download className="w-4 h-4" />
                    PDF herunterladen
                  </a>
                </div>
              )}
              <a
                href={dataUrl}
                download="beleg.pdf"
                className="inline-flex items-center gap-1.5 text-sm text-primary underline self-start"
              >
                <Download className="w-4 h-4" />
                PDF herunterladen
              </a>
            </div>
          ) : isImage ? (
            objectError ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">
                  Bild konnte nicht geladen werden.
                </p>
              </div>
            ) : (
              <img
                src={dataUrl}
                alt="Beleg"
                className="max-w-full max-h-[60vh] rounded object-contain"
                onError={() => setObjectError(true)}
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                Unbekannter Dateityp – Download verfügbar.
              </p>
              <a
                href={dataUrl}
                download="beleg"
                className="inline-flex items-center gap-1.5 text-sm text-primary underline"
              >
                <Download className="w-4 h-4" />
                Herunterladen
              </a>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          {isValidUrl && (
            <a
              href={dataUrl}
              download={isPdf ? "beleg.pdf" : "beleg"}
              className="inline-flex items-center gap-1.5 text-sm text-primary underline self-center mr-auto"
            >
              <Download className="w-3.5 h-3.5" />
              {isPdf ? "PDF herunterladen" : "Bild herunterladen"}
            </a>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Schliessen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Rejection Dialog ─────────────────────────────────────────────────────────

interface RejectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (comment: string | null) => void;
  isLoading: boolean;
}

function RejectionDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
}: RejectionDialogProps) {
  const [comment, setComment] = useState("");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Spesen ablehnen</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Möchtest du diesen Speseneintrag ablehnen? Optional kannst du einen
            Kommentar hinzufügen.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="reject-comment">Kommentar (optional)</Label>
            <Textarea
              id="reject-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Begründung der Ablehnung…"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(comment.trim() || null)}
            disabled={isLoading}
            data-ocid="reject.confirm_button"
          >
            {isLoading ? "Wird abgelehnt…" : "Ablehnen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reset Dialog ──────────────────────────────────────────────────────────────

interface ResetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
  title: string;
}

function ResetDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  title,
}: ResetDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md" data-ocid="reset.dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Der Status wird auf «Ausstehend» zurückgesetzt. Bitte eine
            Begründung angeben.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="reset-reason">
              Begründung <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reset-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setError("");
              }}
              placeholder="Begründung für das Zurücksetzen…"
              rows={3}
              data-ocid="reset.textarea"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            data-ocid="reset.cancel_button"
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            data-ocid="reset.confirm_button"
          >
            {isLoading ? "Wird zurückgesetzt…" : "Zurücksetzen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Expense Form Dialog ──────────────────────────────────────────────────────

interface ExpenseFormDialogProps {
  open: boolean;
  onClose: () => void;
  expenseTypes: ExpenseType[];
  onSubmit: (
    data: ExpenseFormData,
    file: File | null,
    fileDataUrl: string | null,
  ) => Promise<void>;
  isLoading: boolean;
  editExpense?: Expense | null;
  title?: string;
}

function ExpenseFormDialog({
  open,
  onClose,
  expenseTypes,
  onSubmit,
  isLoading,
  editExpense,
  title,
}: ExpenseFormDialogProps) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<ExpenseFormData>({
    date: today,
    expenseTypeId: "",
    billableCHF: 0,
    reimbursementCHF: 0,
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileSizeWarning, setFileSizeWarning] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof ExpenseFormData, string>>
  >({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Initialize form from editExpense when dialog opens
  useEffect(() => {
    if (!open) return;
    if (editExpense) {
      setForm({
        date: editExpense.date,
        expenseTypeId: String(editExpense.expenseTypeId),
        billableCHF: editExpense.billableCHF,
        reimbursementCHF: editExpense.reimbursementCHF,
        description: editExpense.description ?? "",
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
        description: "",
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
      description: "",
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFileSizeWarning("");
    setFileDataUrl(null);

    if (!f) {
      setFilePreview(null);
      return;
    }

    // Size check
    if (f.size > MAX_FILE_BYTES) {
      setFileSizeWarning(
        `Datei zu gross (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximal 1.5 MB erlaubt.`,
      );
      setFile(null);
      setFileDataUrl(null);
      setFilePreview(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    try {
      // Eagerly read all file types as data URL — this ensures the data URL
      // is ready in state before the form submits, avoiding any async race
      // where the File object might become inaccessible (e.g. after dialog close).
      const dataUrl = await fileToDataUrl(f);
      setFileDataUrl(dataUrl);

      // For images also set filePreview for the inline thumbnail in the form
      if (detectIsImage(f.name)) {
        setFilePreview(dataUrl);
      } else {
        // PDF: show icon indicator, no inline preview in form
        setFilePreview(null);
      }
    } catch {
      setFileSizeWarning(
        "Datei konnte nicht gelesen werden. Bitte erneut versuchen.",
      );
      setFile(null);
      setFileDataUrl(null);
      setFilePreview(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ExpenseFormData, string>> = {};
    if (!form.date) errs.date = "Datum ist erforderlich";
    if (!form.expenseTypeId) errs.expenseTypeId = "Spesenart ist erforderlich";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form, file, fileDataUrl);
    handleClose();
  };

  const dialogTitle =
    title ?? (editExpense ? "Spesen bearbeiten" : "Neuer Speseneintrag");

  const hasExistingReceipt = !!(editExpense?.receiptBlobId && !file);
  const existingIsPdf = hasExistingReceipt
    ? detectIsPdf(editExpense!.receiptBlobId!)
    : false;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Datum */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-date">
              Datum <span className="text-destructive">*</span>
            </Label>
            <Input
              id="expense-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              data-ocid="expense.date_input"
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Spesenart */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-type">
              Spesenart <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.expenseTypeId}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, expenseTypeId: v }))
              }
            >
              <SelectTrigger id="expense-type" data-ocid="expense.type_select">
                <SelectValue placeholder="Spesenart auswählen…" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.map((t) => (
                  <SelectItem key={String(t.id)} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.expenseTypeId && (
              <p className="text-xs text-destructive">{errors.expenseTypeId}</p>
            )}
          </div>

          {/* Beträge */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="expense-billable">Verrechenbar CHF</Label>
              <Input
                id="expense-billable"
                type="number"
                min="0"
                step="0.01"
                value={form.billableCHF}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    billableCHF: Number.parseFloat(e.target.value) || 0,
                  }))
                }
                data-ocid="expense.billable_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expense-reimburse">Rückerstattung CHF</Label>
              <Input
                id="expense-reimburse"
                type="number"
                min="0"
                step="0.01"
                value={form.reimbursementCHF}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    reimbursementCHF: Number.parseFloat(e.target.value) || 0,
                  }))
                }
                data-ocid="expense.reimburse_input"
              />
            </div>
          </div>

          {/* Beschreibung */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-desc">Beschreibung</Label>
            <Textarea
              id="expense-desc"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Wofür wurden die Spesen aufgewendet? (optional)"
              rows={3}
              data-ocid="expense.desc_input"
            />
          </div>

          {/* Beleg hochladen */}
          <div className="space-y-1.5">
            <Label>Beleg hochladen</Label>

            {/* Show existing receipt info when editing */}
            {hasExistingReceipt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-md bg-muted/40 border border-border">
                {existingIsPdf ? (
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                )}
                <span>
                  {existingIsPdf ? "PDF-Beleg" : "Bild-Beleg"} vorhanden. Neues
                  Dokument auswählen um zu ersetzen.
                </span>
              </div>
            )}

            <button
              type="button"
              className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => fileRef.current?.click()}
              aria-label="Beleg hochladen"
              data-ocid="expense.upload_button"
            >
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    {detectIsImage(file.name) ? (
                      <ImageIcon className="w-4 h-4 text-primary" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary" />
                    )}
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setFileDataUrl(null);
                      setFilePreview(null);
                      setFileSizeWarning("");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    aria-label="Beleg entfernen"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Paperclip className="w-6 h-6" />
                  <p className="text-sm">Datei auswählen oder hier ablegen</p>
                  <p className="text-xs">JPG, PNG oder PDF (max. 1.5 MB)</p>
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={handleFile}
              data-ocid="expense.file_input"
            />

            {/* Size warning */}
            {fileSizeWarning && (
              <p className="text-xs text-destructive">{fileSizeWarning}</p>
            )}

            {/* Image preview in form */}
            {filePreview && detectIsImage(file?.name ?? "") && (
              <div className="mt-2 rounded-lg overflow-hidden border border-border max-h-40">
                <img
                  src={filePreview}
                  alt="Vorschau"
                  className="w-full h-40 object-contain bg-muted/20"
                />
              </div>
            )}

            {/* PDF selected indicator */}
            {file && detectIsPdf(file.name) && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md border border-border text-sm text-muted-foreground">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <span>
                  PDF ausgewählt: {file.name} – wird beim Speichern hochgeladen.
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              data-ocid="expense.cancel_button"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-ocid="expense.submit_button"
            >
              {isLoading ? "Wird gespeichert…" : "Spesen speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SpesenPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, role, employeeId } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const isAdminOrManager = role === "admin" || role === "manager";
  const isMitarbeiter = role !== "admin" && role !== "manager";

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  // Dialogs
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [rejectExpenseId, setRejectExpenseId] = useState<bigint | null>(null);
  const [resetExpenseId, setResetExpenseId] = useState<bigint | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !companyId) navigate({ to: "/" });
  }, [isAuthenticated, companyId, navigate]);

  // ─── Queries ───────────────────────────────────────────────────────────────

  const buildFilter = (): ExpenseFilter => {
    const filter: ExpenseFilter = {};
    if (dateFrom) filter.dateFrom = dateFrom;
    if (dateTo) filter.dateTo = dateTo;
    if (statusFilter !== "all") filter.status = statusFilter as ExpenseStatus;
    if (isAdminOrManager && employeeFilter !== "all")
      filter.employeeId = BigInt(employeeFilter);
    return filter;
  };

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<
    Expense[]
  >({
    queryKey: [
      "expenses",
      dateFrom,
      dateTo,
      statusFilter,
      employeeFilter,
      companyId,
    ],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await toAny(actor).listExpenses(buildFilter());
        return result as Expense[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!companyId,
    staleTime: 30_000,
  });

  const { data: expenseTypes = [] } = useQuery<ExpenseType[]>({
    queryKey: ["expenseTypes", companyId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await toAny(actor).listExpenseTypes();
        return result as ExpenseType[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!companyId,
    staleTime: 120_000,
  });

  // Only show active expense types in the selection dialog, ensure no empty IDs
  const activeExpenseTypes = expenseTypes.filter(
    (t) => t.aktiv && t.id != null && String(t.id) !== "",
  );

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      if (!actor || !isAdminOrManager) return [];
      try {
        const result = await toAny(actor).listEmployees();
        return result as Employee[];
      } catch {
        return [];
      }
    },
    enabled:
      !!actor &&
      !isFetching &&
      isAuthenticated &&
      !!companyId &&
      isAdminOrManager,
    staleTime: 120_000,
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      fileDataUrl,
    }: { data: ExpenseFormData; fileDataUrl: string | null }) => {
      if (!actor) throw new Error("Nicht verbunden");

      let receiptBlobId: string | undefined;
      if (fileDataUrl) {
        // fileDataUrl was pre-read eagerly during file selection — already a valid data URL
        receiptBlobId = fileDataUrl;
      }

      const input = {
        date: data.date,
        description: data.description || "",
        billableCHF: data.billableCHF,
        reimbursementCHF: data.reimbursementCHF,
        expenseTypeId: BigInt(data.expenseTypeId) as ExpenseTypeId,
        ...(receiptBlobId !== undefined ? { receiptBlobId } : {}),
      };

      const result = await toAny(actor).createExpense(input);
      const res = result as { __kind__: string; err?: string };
      if (res.__kind__ === "err")
        throw new Error(res.err ?? "Fehler beim Speichern");
    },
    onSuccess: () => {
      toast.success("Spesen erfolgreich gespeichert");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      fileDataUrl,
    }: { id: bigint; data: ExpenseFormData; fileDataUrl: string | null }) => {
      if (!actor) throw new Error("Nicht verbunden");

      let receiptBlobId: string | undefined;
      if (fileDataUrl) {
        // fileDataUrl was pre-read eagerly during file selection — already a valid data URL
        receiptBlobId = fileDataUrl;
      }

      const input: UpdateExpenseInput = {
        date: data.date,
        description: data.description || "",
        billableCHF: data.billableCHF,
        reimbursementCHF: data.reimbursementCHF,
        expenseTypeId: BigInt(data.expenseTypeId) as ExpenseTypeId,
        ...(receiptBlobId !== undefined ? { receiptBlobId } : {}),
      };

      const result = await toAny(actor).updateExpense(id, input);
      const res = result as { __kind__: string; err?: string };
      if (res.__kind__ === "err")
        throw new Error(res.err ?? "Fehler beim Aktualisieren");
    },
    onSuccess: () => {
      toast.success("Spesen aktualisiert");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setEditExpense(null);
    },
    onError: (err: Error) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Nicht verbunden");
      const result = await toAny(actor).approveExpense(id);
      const res = result as { __kind__: string; err?: string };
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      toast.success("Spesen genehmigt");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      id,
      comment,
    }: { id: bigint; comment: string | null }) => {
      if (!actor) throw new Error("Nicht verbunden");
      const result = await toAny(actor).rejectExpense(id, comment);
      const res = result as { __kind__: string; err?: string };
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      toast.success("Spesen abgelehnt");
      setRejectExpenseId(null);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  const resetMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: bigint; reason: string }) => {
      if (!actor) throw new Error("Nicht verbunden");
      const result = await toAny(actor).resetExpenseToAusstehend(id, reason);
      const res = result as { __kind__: string; err?: string };
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      toast.success("Spesen auf «Ausstehend» zurückgesetzt");
      setResetExpenseId(null);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => {
      toast.error(`Fehler: ${err.message}`);
      setResetExpenseId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Nicht verbunden");
      const result = await toAny(actor).deleteExpense(id);
      const res = result as { __kind__: string; err?: string };
      if (res.__kind__ === "err") throw new Error(res.err ?? "Fehler");
    },
    onSuccess: () => {
      toast.success("Spesen gelöscht");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (err: Error) => toast.error(`Fehler: ${err.message}`),
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const getExpenseTypeName = (id: ExpenseTypeId): string => {
    const found = expenseTypes.find((t) => t.id === id);
    return found?.name ?? "–";
  };

  const getEmployeeName = (id: bigint): string => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : "–";
  };

  const handleSubmitExpense = async (
    data: ExpenseFormData,
    _file: File | null,
    fileDataUrl: string | null,
  ) => {
    if (editExpense) {
      await updateMutation.mutateAsync({
        id: editExpense.id,
        data,
        fileDataUrl,
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

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Spesen erfassen
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ausgaben und Spesen verwalten
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setEditExpense(null);
              setShowForm(true);
            }}
            data-ocid="expense.primary_button"
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Neuer Speseneintrag
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Datum von</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-ocid="filter.date_from_input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Datum bis</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-ocid="filter.date_to_input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger data-ocid="filter.status_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdminOrManager && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Mitarbeiter
                </Label>
                <Select
                  value={employeeFilter}
                  onValueChange={setEmployeeFilter}
                >
                  <SelectTrigger data-ocid="filter.employee_select">
                    <SelectValue placeholder="Alle Mitarbeitenden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Mitarbeitenden</SelectItem>
                    {employees.map((e) => (
                      <SelectItem key={String(e.id)} value={String(e.id)}>
                        {e.firstName} {e.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1 flex flex-col justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground h-9"
                data-ocid="filter.reset_button"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Zurücksetzen
              </Button>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {expensesLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div
              className="py-16 flex flex-col items-center text-center gap-3"
              data-ocid="expenses.empty_state"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Paperclip className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Keine Spesen gefunden
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {dateFrom ||
                  dateTo ||
                  statusFilter !== "all" ||
                  employeeFilter !== "all"
                    ? "Keine Einträge für die gewählten Filter."
                    : "Noch keine Spesen erfasst. Klicke auf «Neuer Speseneintrag»."}
                </p>
              </div>
              {!dateFrom && !dateTo && statusFilter === "all" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowForm(true)}
                  data-ocid="expenses.empty_state_button"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Neuer Speseneintrag
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Datum</TableHead>
                  <TableHead>Spesenart</TableHead>
                  {isAdminOrManager && <TableHead>Mitarbeiter</TableHead>}
                  <TableHead className="text-right">Verrechenbar CHF</TableHead>
                  <TableHead className="text-right">
                    Rückerstattung CHF
                  </TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead className="text-center">Beleg</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense, idx) => {
                  const isOwn =
                    String(expense.employeeId) === String(employeeId);
                  const isApproved = expense.status === "approved";
                  const isPending = expense.status === "pending";
                  // Mitarbeiter cannot edit/delete approved entries
                  const canEdit =
                    isAdminOrManager || (isOwn && !isApproved && isPending);
                  const canDelete =
                    isAdminOrManager || (isOwn && !isApproved && isPending);

                  return (
                    <TableRow
                      key={String(expense.id)}
                      data-ocid={`expense.item.${idx + 1}`}
                    >
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getExpenseTypeName(expense.expenseTypeId)}
                      </TableCell>
                      {isAdminOrManager && (
                        <TableCell className="text-sm">
                          {getEmployeeName(expense.employeeId)}
                        </TableCell>
                      )}
                      <TableCell className="text-right font-mono text-sm">
                        {expense.billableCHF > 0
                          ? formatCHF(expense.billableCHF)
                          : "–"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {expense.reimbursementCHF > 0
                          ? formatCHF(expense.reimbursementCHF)
                          : "–"}
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px]">
                        <span className="line-clamp-2">
                          {expense.description || "–"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {expense.receiptBlobId ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 p-1"
                            onClick={() =>
                              setReceiptPreview(expense.receiptBlobId!)
                            }
                            aria-label="Beleg anzeigen"
                            data-ocid={`expense.receipt_button.${idx + 1}`}
                            title={
                              detectIsPdf(expense.receiptBlobId)
                                ? "PDF-Beleg anzeigen"
                                : "Bild-Beleg anzeigen"
                            }
                          >
                            {detectIsPdf(expense.receiptBlobId) ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <Paperclip className="w-4 h-4" />
                            )}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">
                            –
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={expense.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {/* Admin/Manager: approve pending */}
                          {isAdminOrManager && isPending && (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-1"
                                onClick={() =>
                                  approveMutation.mutate(expense.id)
                                }
                                disabled={approveMutation.isPending}
                                aria-label="Spesen genehmigen"
                                data-ocid={`expense.approve_button.${idx + 1}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                onClick={() => setRejectExpenseId(expense.id)}
                                aria-label="Spesen ablehnen"
                                data-ocid={`expense.reject_button.${idx + 1}`}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          {/* Admin/Manager: reset approved to pending */}
                          {isAdminOrManager && isApproved && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 p-1"
                              onClick={() => setResetExpenseId(expense.id)}
                              aria-label="Auf Ausstehend zurücksetzen"
                              title="Auf Ausstehend zurücksetzen"
                              data-ocid={`expense.reset_button.${idx + 1}`}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Edit button — pending entries (own for Mitarbeiter, any for Admin) */}
                          {canEdit && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground p-1"
                              onClick={() => {
                                setEditExpense(expense);
                                setShowForm(true);
                              }}
                              aria-label="Spesen bearbeiten"
                              data-ocid={`expense.edit_button.${idx + 1}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Delete button */}
                          {canDelete && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive/80 p-1"
                              onClick={() => setDeleteConfirmId(expense.id)}
                              aria-label="Spesen löschen"
                              data-ocid={`expense.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Lock icon for Mitarbeiter on approved entries */}
                          {isMitarbeiter && isApproved && isOwn && (
                            <Lock
                              className="w-3.5 h-3.5 text-muted-foreground/50"
                              aria-label="Genehmigte Spesen können nicht bearbeitet werden"
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Expense Form Dialog */}
      <ExpenseFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditExpense(null);
        }}
        expenseTypes={activeExpenseTypes}
        onSubmit={handleSubmitExpense}
        isLoading={isFormLoading}
        editExpense={editExpense}
      />

      {/* Receipt Preview */}
      {receiptPreview && (
        <ReceiptPreviewDialog
          dataUrl={receiptPreview}
          open={!!receiptPreview}
          onClose={() => setReceiptPreview(null)}
        />
      )}

      {/* Rejection Dialog */}
      <RejectionDialog
        open={!!rejectExpenseId}
        onClose={() => setRejectExpenseId(null)}
        onConfirm={(comment) => {
          if (rejectExpenseId)
            rejectMutation.mutate({ id: rejectExpenseId, comment });
        }}
        isLoading={rejectMutation.isPending}
      />

      {/* Reset Dialog */}
      <ResetDialog
        open={!!resetExpenseId}
        onClose={() => setResetExpenseId(null)}
        onConfirm={(reason) => {
          if (resetExpenseId)
            resetMutation.mutate({ id: resetExpenseId, reason });
        }}
        isLoading={resetMutation.isPending}
        title="Spesen zurücksetzen"
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteConfirmId}
        onConfirm={() => {
          if (deleteConfirmId !== null) {
            deleteMutation.mutate(deleteConfirmId);
          }
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
        isDeleting={deleteMutation.isPending}
      />
    </Layout>
  );
}
