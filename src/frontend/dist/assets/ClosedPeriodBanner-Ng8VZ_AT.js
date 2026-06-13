import { j as jsxRuntimeExports } from "./index-D_yjRFGt.js";
import { L as Lock } from "./lock-BD6_Ipmh.js";
function formatTimestamp(ts) {
  if (!ts) return "";
  const ms = Number(ts / 1000000n);
  return new Date(ms).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
function ClosedPeriodBanner({
  closedAt,
  closedByName,
  onRequestReopen,
  canReopen = false
}) {
  const dateStr = formatTimestamp(closedAt);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "period-close.closed_banner",
      className: "period-closed-banner",
      role: "alert",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
          "Diese Periode ist abgeschlossen",
          dateStr && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            " ",
            "am ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: dateStr })
          ] }),
          closedByName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            " ",
            "durch ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: closedByName })
          ] }),
          ".",
          " Änderungen sind nicht mehr möglich. Bitte wende dich an deinen Firmenadministrator."
        ] }),
        canReopen && onRequestReopen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "period-close.reopen_request_button",
            onClick: onRequestReopen,
            className: "ml-4 text-xs underline hover:no-underline flex-shrink-0",
            children: "Periode öffnen"
          }
        )
      ]
    }
  );
}
export {
  ClosedPeriodBanner as C
};
