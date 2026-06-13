import { j as jsxRuntimeExports } from "./index-D_yjRFGt.js";
import { B as Button } from "./button-BXNzWYpr.js";
import { D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, k as DialogFooter } from "./Layout-BOoVnXJI.js";
function DeleteConfirmDialog({
  open,
  onConfirm,
  onCancel,
  isDeleting = false,
  title = "Eintrag löschen?",
  description = "Bist du sicher, dass du diesen Eintrag löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden."
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onOpenChange: (v) => {
        if (!v) onCancel();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", "data-ocid": "delete-confirm.dialog", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-2", children: description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: onCancel,
              disabled: isDeleting,
              "data-ocid": "delete-confirm.cancel_button",
              children: "Abbrechen"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "destructive",
              onClick: onConfirm,
              disabled: isDeleting,
              "data-ocid": "delete-confirm.confirm_button",
              children: isDeleting ? "Löschen…" : "Ja, löschen"
            }
          )
        ] })
      ] })
    }
  );
}
export {
  DeleteConfirmDialog as D
};
