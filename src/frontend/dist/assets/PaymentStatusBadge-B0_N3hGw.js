import { c as createLucideIcon } from "./createLucideIcon-BzNCDVU7.js";
import { j as jsxRuntimeExports } from "./index-Blf-A8DR.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    { d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z", key: "q3az6g" }
  ],
  ["path", { d: "M14 8H8", key: "1l3xfs" }],
  ["path", { d: "M16 12H8", key: "1fr5h0" }],
  ["path", { d: "M13 16H8", key: "wsln4y" }]
];
const ReceiptText = createLucideIcon("receipt-text", __iconNode);
const STATUS_MAP = {
  active: {
    label: "Aktiv",
    classes: "bg-green-100 text-green-700 border-green-200"
  },
  past_due: {
    label: "Zahlung ausstehend",
    classes: "bg-orange-100 text-orange-700 border-orange-200"
  },
  unpaid: {
    label: "Unbezahlt",
    classes: "bg-red-100 text-red-700 border-red-200"
  },
  canceled: {
    label: "Gekündigt",
    classes: "bg-muted text-muted-foreground border-border"
  },
  incomplete: {
    label: "Ausstehend",
    classes: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  incomplete_expired: {
    label: "Abgelaufen",
    classes: "bg-muted text-muted-foreground border-border"
  },
  pending_payment: {
    label: "Zahlung in Bearbeitung",
    classes: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  trialing: {
    label: "Testphase",
    classes: "bg-blue-100 text-blue-700 border-blue-200"
  }
};
function PaymentStatusBadge({
  status,
  className
}) {
  const config = status ? STATUS_MAP[status] ?? null : null;
  if (!config) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border ${className ?? ""}`,
        "data-ocid": "billing.payment_status_badge",
        children: "Kein Abonnement"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.classes} ${className ?? ""}`,
      "data-ocid": "billing.payment_status_badge",
      children: config.label
    }
  );
}
export {
  PaymentStatusBadge as P,
  ReceiptText as R
};
