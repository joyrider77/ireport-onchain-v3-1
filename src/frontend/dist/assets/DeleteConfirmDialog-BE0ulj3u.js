import { c as createLucideIcon } from "./createLucideIcon-B_8OnPXI.js";
import { j as jsxRuntimeExports } from "./index-CzAnGejr.js";
import { B as Button } from "./button-De0KTRQr.js";
import { D as Dialog, g as DialogContent, h as DialogHeader, i as DialogTitle, k as DialogFooter } from "./Layout-B1HD-_-K.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode);
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
  DeleteConfirmDialog as D,
  Pencil as P,
  Trash2 as T
};
