import { j as jsxRuntimeExports, r as reactExports, S as Skeleton } from "./index-D_yjRFGt.js";
import { P as PeriodCloseStatus, d as useAuth, u as useActor, b as useQuery, c as createActor } from "./useAuthStore-RPelH0kd.js";
import { D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, k as DialogFooter, j as Checkbox, L as Layout, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./Layout-BOoVnXJI.js";
import { B as Button } from "./button-BXNzWYpr.js";
import { L as Label, u as ue } from "./index-SoMYIp0N.js";
import { T as Textarea } from "./textarea-DOcRjrEq.js";
import { L as LoaderCircle } from "./loader-circle-DPIlcj_m.js";
import { C as CircleAlert } from "./circle-alert-DtnCEIpe.js";
import { T as TriangleAlert } from "./triangle-alert-B5iOPlZp.js";
import { C as CircleCheck } from "./circle-check-CdoWZXIR.js";
import { L as Lock } from "./lock-BD6_Ipmh.js";
import { c as createLucideIcon } from "./createLucideIcon-C599ATMm.js";
import { a as useClosePeriod, b as useReopenPeriod, c as useListPeriodCloses } from "./usePeriodClose-CQO8NlO9.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-Cqx-QXhC.js";
import "./x-BHvIGru9.js";
import "./index-HGa3Ynxo.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1", key: "1mm8w8" }]
];
const LockOpen = createLucideIcon("lock-open", __iconNode);
const VERDICT_LABEL = {
  ok: "Abschliessbar",
  ok_with_warnings: "Abschliessbar mit Warnungen",
  blocked: "Nicht abschliessbar"
};
function VerdictIcon({ verdict }) {
  if (verdict === "ok")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-primary flex-shrink-0" });
  if (verdict === "ok_with_warnings")
    return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-destructive flex-shrink-0" });
}
function MonthlyClosePrecheckPanel({
  result,
  loading = false,
  error = null
}) {
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "period-close.precheck_panel.loading_state",
        className: "period-precheck-panel flex items-center gap-2 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Vorprüfung wird durchgeführt…" })
        ]
      }
    );
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "period-close.precheck_panel.error_state",
        className: "period-precheck-panel period-precheck-item error",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Vorprüfung fehlgeschlagen: ",
            error
          ] })
        ]
      }
    );
  }
  if (!result) return null;
  const {
    verdict,
    blockers,
    warnings,
    hasOpenEntries,
    hasOpenAbsences,
    hasOpenExpenses,
    hasComplianceViolations,
    missingDays
  } = result;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "period-close.precheck_panel",
      className: "period-precheck-panel",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(VerdictIcon, { verdict }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Vorprüfung: ",
            VERDICT_LABEL[verdict] ?? verdict
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 mt-2", children: [
          hasOpenEntries && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "period-precheck-item warning", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Provisorische oder nicht validierte Zeiteinträge vorhanden" })
          ] }),
          hasOpenAbsences && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "period-precheck-item warning", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Offene Ferien- oder Abwesenheitsanträge vorhanden" })
          ] }),
          hasOpenExpenses && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "period-precheck-item warning", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Offene Spesen vorhanden" })
          ] }),
          hasComplianceViolations && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "period-precheck-item warning", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Compliance-Verletzungen festgestellt" })
          ] }),
          Number(missingDays) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "period-precheck-item warning", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              Number(missingDays),
              " Tag(e) ohne Zeiterfassung trotz Sollzeit"
            ] })
          ] })
        ] }),
        blockers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: blockers.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "period-precheck-item error",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3.5 h-3.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b })
            ]
          },
          i
        )) }),
        warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1", children: warnings.map((w, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "period-precheck-item warning",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: w })
            ]
          },
          i
        )) })
      ]
    }
  );
}
function ClosePeriodDialog({
  open,
  onOpenChange,
  employee,
  month,
  year,
  precheckResult,
  precheckLoading = false,
  precheckError = null,
  onConfirm,
  isBulk = false,
  bulkCount = 0
}) {
  const [comment, setComment] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("de-CH", {
    month: "long",
    year: "numeric"
  });
  const canClose = (precheckResult == null ? void 0 : precheckResult.canClose) !== false;
  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(comment);
      setComment("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { "data-ocid": "period-close.close_dialog", className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4 text-primary" }),
      isBulk ? `${bulkCount} Mitarbeitende abschliessen` : `Periode abschliessen – ${employee ? `${employee.firstName} ${employee.lastName}` : ""}`
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Monat: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: monthLabel })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        MonthlyClosePrecheckPanel,
        {
          result: precheckResult ?? null,
          loading: precheckLoading,
          error: precheckError
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "close-comment", children: "Abschlusskommentar (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "close-comment",
            "data-ocid": "period-close.close_dialog.comment_input",
            placeholder: "Optionaler Kommentar zum Abschluss…",
            value: comment,
            onChange: (e) => setComment(e.target.value),
            rows: 2,
            className: "resize-none"
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
          "data-ocid": "period-close.close_dialog.cancel_button",
          onClick: () => onOpenChange(false),
          disabled: submitting,
          children: "Abbrechen"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          "data-ocid": "period-close.close_dialog.confirm_button",
          onClick: handleConfirm,
          disabled: submitting || !canClose || precheckLoading,
          children: [
            submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4 mr-2" }),
            "Abschliessen"
          ]
        }
      )
    ] })
  ] }) });
}
const STATUS_LABELS = {
  open: "Offen",
  ready_for_close: "Bereit",
  closed: "Abgeschlossen",
  reopened: "Wieder geöffnet"
};
const STATUS_BADGE_CLASS = {
  open: "period-badge period-badge-open",
  ready_for_close: "period-badge period-badge-ready",
  closed: "period-badge period-badge-closed",
  reopened: "period-badge period-badge-reopened"
};
function MonthlyCloseStatusBadge({
  status,
  className = ""
}) {
  const badgeClass = STATUS_BADGE_CLASS[status] ?? "period-badge period-badge-open";
  const label = STATUS_LABELS[status] ?? status;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      "data-ocid": "period-close.status_badge",
      className: `${badgeClass} ${className}`,
      children: label
    }
  );
}
function ReopenPeriodDialog({
  open,
  onOpenChange,
  employeeName,
  month,
  year,
  requireReason = true,
  onConfirm
}) {
  const [reason, setReason] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("de-CH", {
    month: "long",
    year: "numeric"
  });
  const canSubmit = !requireReason || reason.trim().length > 0;
  const handleConfirm = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      "data-ocid": "period-close.reopen_dialog",
      className: "max-w-md",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "w-4 h-4 text-primary" }),
          "Periode wieder öffnen"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-1", children: [
          employeeName && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Mitarbeiter: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: employeeName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Monat: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: monthLabel })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground", children: "Die abgeschlossene Periode wird wieder geöffnet. Die Wiederöffnung wird im Audit-Protokoll festgehalten." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "reopen-reason", children: [
              "Begründung",
              requireReason && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive ml-0.5", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                id: "reopen-reason",
                "data-ocid": "period-close.reopen_dialog.reason_input",
                placeholder: "Begründung für die Wiederöffnung…",
                value: reason,
                onChange: (e) => setReason(e.target.value),
                rows: 3,
                className: "resize-none"
              }
            ),
            requireReason && reason.trim().length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                "data-ocid": "period-close.reopen_dialog.reason_error",
                className: "text-xs text-destructive",
                children: "Begründung ist erforderlich."
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
              "data-ocid": "period-close.reopen_dialog.cancel_button",
              onClick: () => onOpenChange(false),
              disabled: submitting,
              children: "Abbrechen"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              "data-ocid": "period-close.reopen_dialog.confirm_button",
              onClick: handleConfirm,
              disabled: submitting || !canSubmit,
              children: [
                submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "w-4 h-4 mr-2" }),
                "Periode öffnen"
              ]
            }
          )
        ] })
      ]
    }
  ) });
}
function getStatus(periodClose) {
  if (!periodClose) return PeriodCloseStatus.open;
  return String(periodClose.status);
}
function MonthlyCloseEmployeeRow({
  companyId,
  employeeId,
  employeeName,
  month,
  year,
  periodClose,
  index,
  selected = false,
  onToggle
}) {
  const [closeOpen, setCloseOpen] = reactExports.useState(false);
  const [reopenOpen, setReopenOpen] = reactExports.useState(false);
  const closeMutation = useClosePeriod();
  const reopenMutation = useReopenPeriod();
  const status = getStatus(periodClose);
  const isClosed = status === PeriodCloseStatus.closed;
  const handleClose = async (comment) => {
    await new Promise((resolve, reject) => {
      closeMutation.mutate(
        { companyId, employeeId, month, year, closeComment: comment },
        {
          onSuccess: () => {
            setCloseOpen(false);
            ue.success("Periode abgeschlossen");
            resolve();
          },
          onError: () => {
            ue.error("Fehler beim Abschliessen");
            reject(new Error("close failed"));
          }
        }
      );
    });
  };
  const handleReopen = async (reason) => {
    if (!periodClose) return;
    await new Promise((resolve, reject) => {
      reopenMutation.mutate(
        { closeId: periodClose.closeId, reopenReason: reason },
        {
          onSuccess: () => {
            setReopenOpen(false);
            ue.success("Periode wieder geöffnet");
            resolve();
          },
          onError: () => {
            ue.error("Fehler beim Wiederöffnen");
            reject(new Error("reopen failed"));
          }
        }
      );
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "tr",
      {
        "data-ocid": `monthly_close.item.${index}`,
        className: "border-b hover:bg-muted/30 transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: onToggle && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: selected,
              onCheckedChange: () => onToggle(employeeId),
              disabled: isClosed,
              "aria-label": `${employeeName} auswählen`,
              "data-ocid": `monthly_close.checkbox.${index}`
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: employeeName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            month.toString().padStart(2, "0"),
            "/",
            year
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MonthlyCloseStatusBadge, { status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: (periodClose == null ? void 0 : periodClose.closedAt) && Number(periodClose.closedAt) > 0 ? new Date(
            Number(periodClose.closedAt) / 1e6
          ).toLocaleDateString("de-CH") : "–" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 flex gap-2", children: !isClosed ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              onClick: () => setCloseOpen(true),
              "data-ocid": `monthly_close.close_button.${index}`,
              children: "Abschliessen"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => setReopenOpen(true),
              "data-ocid": `monthly_close.reopen_button.${index}`,
              children: "Wieder öffnen"
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClosePeriodDialog,
      {
        open: closeOpen,
        onOpenChange: setCloseOpen,
        employee: null,
        month,
        year,
        onConfirm: handleClose
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReopenPeriodDialog,
      {
        open: reopenOpen,
        onOpenChange: setReopenOpen,
        employeeName,
        month,
        year,
        onConfirm: handleReopen
      }
    )
  ] });
}
function findPeriodClose(closes, employeeId) {
  return closes.find((c) => c.employeeId === employeeId) ?? null;
}
function MonthlyCloseOverview({
  companyId,
  employees,
  month,
  year,
  selectedEmployeeIds = [],
  onToggleEmployee,
  onToggleAll,
  allSelected = false
}) {
  const { data: closes = [], isLoading } = useListPeriodCloses(
    companyId !== void 0 ? BigInt(String(companyId)) : void 0,
    month,
    year
  );
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", "data-ocid": "monthly_close.loading_state", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) });
  }
  if (employees.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "text-center py-12 text-muted-foreground",
        "data-ocid": "monthly_close.empty_state",
        children: "Keine Mitarbeitenden gefunden."
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", "data-ocid": "monthly_close.table", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b bg-muted/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left w-10", children: onToggleAll && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Checkbox,
        {
          checked: allSelected,
          onCheckedChange: onToggleAll,
          "aria-label": "Alle auswählen",
          "data-ocid": "monthly_close.select_all_checkbox"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Mitarbeitende/r" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Periode" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Abgeschlossen am" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left font-semibold", children: "Aktionen" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: employees.map((emp, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MonthlyCloseEmployeeRow,
      {
        companyId,
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        month,
        year,
        periodClose: findPeriodClose(closes, emp.employeeId),
        index: idx + 1,
        selected: selectedEmployeeIds.includes(emp.employeeId.toString()),
        onToggle: onToggleEmployee
      },
      emp.employeeId.toString()
    )) })
  ] }) });
}
const MONTHS = [
  { value: 1, label: "Januar" },
  { value: 2, label: "Februar" },
  { value: 3, label: "März" },
  { value: 4, label: "April" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Dezember" }
];
function MonthlyClosePage() {
  const { role, companyId } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const now = /* @__PURE__ */ new Date();
  const [month, setMonth] = reactExports.useState(now.getMonth() + 1);
  const [year, setYear] = reactExports.useState(now.getFullYear());
  const [selectedEmployeeIds, setSelectedEmployeeIds] = reactExports.useState([]);
  const [bulkCloseOpen, setBulkCloseOpen] = reactExports.useState(false);
  const canManage = role === "admin" || role === "manager";
  const closeMutation = useClosePeriod();
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employeesForClose", companyId == null ? void 0 : companyId.toString()],
    queryFn: async () => {
      if (!actor || !companyId) return [];
      try {
        const result = await actor.listEmployees(
          companyId
        );
        const list = result;
        return list.map((e) => ({
          employeeId: e.id,
          employeeName: `${e.firstName} ${e.lastName}`
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!companyId,
    retry: 2,
    staleTime: 6e4
  });
  const years = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1
  ];
  const cid = companyId != null ? BigInt(String(companyId)) : BigInt(0);
  const selectableEmployees = employees.filter((_e) => {
    return true;
  });
  const allSelected = selectableEmployees.length > 0 && selectableEmployees.every(
    (e) => selectedEmployeeIds.includes(e.employeeId.toString())
  );
  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(
        selectableEmployees.map((e) => e.employeeId.toString())
      );
    }
  };
  const handleToggleEmployee = (employeeId) => {
    const id = employeeId.toString();
    setSelectedEmployeeIds(
      (prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleBulkClose = async () => {
    if (selectedEmployeeIds.length === 0) return;
    let successCount = 0;
    let errorCount = 0;
    for (const idStr of selectedEmployeeIds) {
      try {
        await new Promise((resolve, reject) => {
          closeMutation.mutate(
            {
              companyId: cid,
              employeeId: BigInt(idStr),
              month,
              year
            },
            {
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: () => {
                errorCount++;
                reject(new Error("close failed"));
              }
            }
          );
        });
      } catch {
      }
    }
    setBulkCloseOpen(false);
    setSelectedEmployeeIds([]);
    if (successCount > 0) {
      ue.success(
        `${successCount} Mitarbeitende wurden erfolgreich abgeschlossen.`
      );
    }
    if (errorCount > 0) {
      ue.error(
        `Bei ${errorCount} Mitarbeitenden ist ein Fehler aufgetreten.`
      );
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", "data-ocid": "monthly_close.page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Monatsabschluss" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Periode auswählen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: String(month),
              onValueChange: (v) => setMonth(Number(v)),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SelectTrigger,
                  {
                    className: "w-40",
                    "data-ocid": "monthly_close.month_select",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MONTHS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m.value), children: m.label }, m.value)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Jahr" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: String(year),
              onValueChange: (v) => setYear(Number(v)),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SelectTrigger,
                  {
                    className: "w-28",
                    "data-ocid": "monthly_close.year_select",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
              ]
            }
          )
        ] })
      ] })
    ] }),
    !canManage ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-8 text-center text-muted-foreground", children: "Sie haben keine Berechtigung, Perioden abzuschliessen." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Mitarbeitende" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => setBulkCloseOpen(true),
            disabled: selectedEmployeeIds.length === 0,
            className: "bg-[#006066] hover:bg-[#004d52] text-white",
            "data-ocid": "monthly_close.bulk_close_button",
            children: [
              "Alle abschliessen (",
              selectedEmployeeIds.length,
              ")"
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MonthlyCloseOverview,
        {
          companyId: cid,
          employees: isLoading ? [] : employees,
          month,
          year,
          selectedEmployeeIds,
          onToggleEmployee: handleToggleEmployee,
          onToggleAll: handleToggleAll,
          allSelected
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: bulkCloseOpen, onOpenChange: setBulkCloseOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Monatsabschluss bestätigen" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Möchtest du den Monatsabschluss für",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedEmployeeIds.length }),
        " Mitarbeitende für",
        " ",
        month.toString().padStart(2, "0"),
        ".",
        year,
        " durchführen?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: () => setBulkCloseOpen(false),
            "data-ocid": "monthly_close.bulk_cancel_button",
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleBulkClose,
            className: "bg-[#006066] hover:bg-[#004d52] text-white",
            "data-ocid": "monthly_close.bulk_confirm_button",
            children: "Jetzt abschliessen"
          }
        )
      ] })
    ] }) })
  ] }) });
}
export {
  MonthlyClosePage as default
};
