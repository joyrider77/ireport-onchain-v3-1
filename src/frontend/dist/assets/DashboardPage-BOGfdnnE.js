import { j as jsxRuntimeExports, r as reactExports, R as React, b as clsx, S as Skeleton, a as useNavigate } from "./index-Blf-A8DR.js";
import { f as formatHours, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, u as useCompanyTimezone, L as Layout, e as formatDateInTz, C as ChartNoAxesColumn } from "./Layout-ClH0znk9.js";
import { u as useActor, c as createActor, b as useAuth, d as useQuery } from "./useAuthStore-Cbv7GIMf.js";
import { a as aggregateForWeek, b as aggregateForMonth, c as aggregateForYear, d as aggregateForDay, e as calcSollzeitForDateRange, f as formatPeriodLabel, g as getISOWeekNumber, h as getISOWeekYear } from "./timeOverviewAggregation-BCmGA-wR.js";
import { B as Badge } from "./badge-BrNtKZcv.js";
import { C as CircleX } from "./circle-x-DBFfgxOH.js";
import { T as TriangleAlert } from "./triangle-alert-DaIOcezk.js";
import { C as CircleCheck } from "./circle-check-D0suFTwN.js";
import { I as Info } from "./info-BiURhlsP.js";
import { k as Clock, l as Calendar, j as ChevronLeft, h as ChevronRight, R as Receipt } from "./users-DUrIKgtR.js";
import { c as createLucideIcon } from "./createLucideIcon-BzNCDVU7.js";
import { B as Button } from "./button-DCGMFvti.js";
import { D as Download } from "./download-D7N_keje.js";
import { f as filterProps, L as Layer, m as max, i as isNumber, C as Curve, A as Animate, a as interpolateNumber, b as isNil, c as isNan, d as isEqual, h as hasClipDot, e as LabelList, u as uniqueId, g as isFunction, G as Global, j as getValueByDataKey, k as getCateCoordinateOfLine, D as Dot, S as Shape, l as Symbols, n as adaptEventsOfChild, o as findAllByType, E as ErrorBar, p as getLinearRegression, q as Cell, r as generateCategoricalChart, s as Line, B as Bar, X as XAxis, Y as YAxis, t as formatAxisMap, R as ResponsiveContainer, v as CartesianGrid, T as Tooltip, w as Legend, x as BarChart } from "./BarChart-BKO1_blp.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-CHW-R_CT.js";
import { g as getActiveEmploymentForDate, a as getEmploymentMinutesForDate, n as nanosToLocalIsoDate, c as countVacationDaysProportional } from "./employmentUtils-C-5ZbofZ.js";
import { m as minutesToHhMm } from "./shared-Ccf5834I.js";
import { T as TrendingUp } from "./trending-up-B4SWSNqc.js";
import { P as Plus } from "./plus-DRvlFs_3.js";
import "./index-CVvtv_EE.js";
import "./index-Dv8dTxpA.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", key: "jecpp" }],
  ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2", key: "i6l2r4" }]
];
const Briefcase = createLucideIcon("briefcase", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "m9 16 2 2 4-4", key: "19s6y9" }]
];
const CalendarCheck = createLucideIcon("calendar-check", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
];
const Sun = createLucideIcon("sun", __iconNode);
function PauseComplianceHint({
  status,
  meldung,
  workMinutes,
  requiredPauseMinutes,
  detectedPauseMinutes
}) {
  if (workMinutes === 0) return null;
  const styles = {
    ok: {
      container: "bg-green-50 border-green-200 text-green-700",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 shrink-0 text-green-500" })
    },
    not_required: {
      container: "bg-green-50 border-green-200 text-green-700",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 shrink-0 text-green-500" })
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-700",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 shrink-0 text-yellow-500" })
    },
    violation: {
      container: "bg-red-50 border-red-200 text-red-700",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 shrink-0 text-red-500" })
    }
  };
  const s = styles[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `flex items-start gap-2 rounded-md border px-3 py-2 mt-2 text-sm ${s.container}`,
      "data-ocid": "day-detail.pause-compliance-hint",
      children: [
        s.icon,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: meldung }),
          status !== "not_required" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-80 mt-0.5", children: [
            "Erkannt: ",
            detectedPauseMinutes,
            " Min | Erforderlich:",
            " ",
            requiredPauseMinutes,
            " Min"
          ] })
        ] })
      ]
    }
  );
}
const CATEGORY_STYLES = {
  arbeitszeit: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "w-4 h-4" })
  },
  ferien: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-4 h-4" })
  },
  abwesenheit: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4" })
  },
  feiertag: {
    bg: "bg-red-50",
    border: "border-red-100",
    text: "text-red-700",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" })
  }
};
const CATEGORY_LABELS = {
  arbeitszeit: "Arbeitszeit",
  ferien: "Ferien",
  abwesenheit: "Abwesenheit",
  feiertag: "Feiertag"
};
const nsToTimeStr = (ns) => {
  const totalSeconds = Number(ns / 1000000000n);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};
function DayDetailView({
  dayData,
  sollzeit,
  isoDate,
  employeeId
}) {
  const [y, m, d] = isoDate.split("-");
  const dateLabel = `${d}.${m}.${y}`;
  const { actor } = useActor(createActor);
  const [detectedPauses, setDetectedPauses] = reactExports.useState([]);
  const [pauseCompliance, setPauseCompliance] = reactExports.useState(null);
  const [pauseLoading, setPauseLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!actor || !employeeId || !isoDate) return;
    let cancelled = false;
    setPauseLoading(true);
    Promise.all([
      actor.getPausesForDay(employeeId, isoDate),
      actor.getPauseComplianceForDay(employeeId, isoDate)
    ]).then(([pauses, compliance]) => {
      if (!cancelled) {
        setDetectedPauses(pauses);
        setPauseCompliance(compliance);
      }
    }).catch(() => {
    }).finally(() => {
      if (!cancelled) setPauseLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [actor, employeeId, isoDate]);
  if (dayData.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-12 text-center",
        "data-ocid": "day-detail.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-8 h-8 text-muted-foreground/30 mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "Keine Einträge für diesen Tag (",
            dateLabel,
            ")"
          ] }),
          sollzeit > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground/70 mt-1", children: [
            "Sollzeit: ",
            formatHours(sollzeit)
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", "data-ocid": "day-detail-view", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-lg border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
        "Sollzeit:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground tabular-nums", children: formatHours(sollzeit) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs text-muted-foreground", children: dateLabel })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: dayData.map((entry, idx) => {
      const style = CATEGORY_STYLES[entry.category];
      const key = `${entry.category}-${idx}-${entry.label}`;
      const statusLabel = entry.status === "approved" ? "Genehmigt" : entry.status === "rejected" ? "Abgelehnt" : entry.status === "pending" || entry.status === "submitted" ? "Ausstehend" : null;
      const pauseAfterEntry = entry.category === "arbeitszeit" && entry.bis ? detectedPauses.find(
        (p) => nsToTimeStr(p.pauseStart) === entry.bis
      ) : void 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `rounded-lg border p-3 ${style.bg} ${style.border}`,
            "data-ocid": `day-detail.item.${idx + 1}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-2 ${style.text}`, children: [
              style.icon,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide opacity-70", children: CATEGORY_LABELS[entry.category] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium break-words", children: entry.label }),
                entry.von || entry.bis ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-80", children: [
                  entry.von ?? "",
                  entry.von && entry.bis ? " – " : "",
                  entry.bis ?? ""
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-70", children: [
                  "Dauer:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium tabular-nums", children: formatHours(entry.dauer) })
                ] }),
                entry.projekt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-70", children: [
                  "Projekt:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: entry.projekt })
                ] }),
                entry.leistungsart && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-70", children: [
                  "Leistungsart:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: entry.leistungsart })
                ] }),
                entry.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-70 break-words", children: entry.description }),
                statusLabel && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Badge,
                  {
                    variant: "outline",
                    className: `text-[0.65rem] px-1.5 py-0 h-4 ${entry.status === "approved" ? "border-green-300 text-green-700 bg-green-50" : entry.status === "rejected" ? "border-red-300 text-red-700 bg-red-50" : "border-amber-300 text-amber-700 bg-amber-50"}`,
                    children: statusLabel
                  }
                )
              ] }),
              (entry.von || entry.bis) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold tabular-nums whitespace-nowrap", children: formatHours(entry.dauer) })
            ] })
          }
        ),
        pauseAfterEntry && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 bg-muted/30 border border-dashed border-border rounded px-3 py-2 my-1 text-sm text-muted-foreground col-span-full",
            "data-ocid": `day-detail.pause.${idx + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground/60", children: "Pause" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                nsToTimeStr(pauseAfterEntry.pauseStart),
                " –",
                " ",
                nsToTimeStr(pauseAfterEntry.pauseEnd)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto font-medium", children: [
                Number(pauseAfterEntry.durationMinutes),
                " Min"
              ] }),
              pauseAfterEntry.ignored && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground/40", children: "(Ignoriert)" })
            ]
          },
          `pause-${pauseAfterEntry.pauseStart}`
        )
      ] }, key);
    }) }),
    !pauseLoading && pauseCompliance && employeeId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      PauseComplianceHint,
      {
        status: pauseCompliance.status,
        meldung: pauseCompliance.meldung,
        workMinutes: Number(pauseCompliance.workDurationMinutes),
        requiredPauseMinutes: Number(pauseCompliance.requiredPauseMinutes),
        detectedPauseMinutes: Number(pauseCompliance.detectedPauseMinutes)
      }
    )
  ] });
}
function ExportMenu() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      disabled: true,
      "data-ocid": "export-menu-button",
      className: "text-muted-foreground",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-1.5" }),
        "Exportieren"
      ]
    }
  );
}
function PeriodNavigator({ label, onPrev, onNext }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", "data-ocid": "period-navigator", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onPrev,
        "aria-label": "Vorheriger Zeitraum",
        "data-ocid": "period-nav-prev",
        className: "p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "text-sm font-semibold text-foreground tabular-nums min-w-[140px] text-center",
        "data-ocid": "period-nav-label",
        children: label
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onNext,
        "aria-label": "Nächster Zeitraum",
        "data-ocid": "period-nav-next",
        className: "p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4" })
      }
    )
  ] });
}
const PERIODS = [
  { value: "day", label: "Tag" },
  { value: "week", label: "Woche" },
  { value: "month", label: "Monat" },
  { value: "year", label: "Jahr" }
];
function PeriodSelector({ value, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "inline-flex rounded-lg border border-border overflow-hidden",
      role: "tablist",
      "aria-label": "Zeitraum wählen",
      "data-ocid": "period-selector",
      children: PERIODS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": value === p.value,
          onClick: () => onChange(p.value),
          "data-ocid": `period-tab.${p.value}`,
          className: [
            "px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === p.value ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
          ].join(" "),
          children: p.label
        },
        p.value
      ))
    }
  );
}
var _excluded$1 = ["layout", "type", "stroke", "connectNulls", "isRange", "ref"], _excluded2 = ["key"];
var _Area;
function _typeof$2(o) {
  "@babel/helpers - typeof";
  return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof$2(o);
}
function _objectWithoutProperties$1(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose$1(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose$1(source, excluded) {
  if (source == null) return {};
  var target = {};
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _extends$2() {
  _extends$2 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$2.apply(this, arguments);
}
function ownKeys$1(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread$1(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys$1(Object(t), true).forEach(function(r2) {
      _defineProperty$2(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _classCallCheck$2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$2(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey$2(descriptor.key), descriptor);
  }
}
function _createClass$2(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$2(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties$2(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _callSuper$2(t, o, e) {
  return o = _getPrototypeOf$2(o), _possibleConstructorReturn$2(t, _isNativeReflectConstruct$2() ? Reflect.construct(o, e || [], _getPrototypeOf$2(t).constructor) : o.apply(t, e));
}
function _possibleConstructorReturn$2(self, call) {
  if (call && (_typeof$2(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized$2(self);
}
function _assertThisInitialized$2(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _isNativeReflectConstruct$2() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct$2 = function _isNativeReflectConstruct2() {
    return !!t;
  })();
}
function _getPrototypeOf$2(o) {
  _getPrototypeOf$2 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf$2(o);
}
function _inherits$2(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf$2(subClass, superClass);
}
function _setPrototypeOf$2(o, p) {
  _setPrototypeOf$2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf$2(o, p);
}
function _defineProperty$2(obj, key, value) {
  key = _toPropertyKey$2(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$2(t) {
  var i = _toPrimitive$2(t, "string");
  return "symbol" == _typeof$2(i) ? i : i + "";
}
function _toPrimitive$2(t, r) {
  if ("object" != _typeof$2(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != _typeof$2(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Area = /* @__PURE__ */ function(_PureComponent) {
  function Area2() {
    var _this;
    _classCallCheck$2(this, Area2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper$2(this, Area2, [].concat(args));
    _defineProperty$2(_this, "state", {
      isAnimationFinished: true
    });
    _defineProperty$2(_this, "id", uniqueId("recharts-area-"));
    _defineProperty$2(_this, "handleAnimationEnd", function() {
      var onAnimationEnd = _this.props.onAnimationEnd;
      _this.setState({
        isAnimationFinished: true
      });
      if (isFunction(onAnimationEnd)) {
        onAnimationEnd();
      }
    });
    _defineProperty$2(_this, "handleAnimationStart", function() {
      var onAnimationStart = _this.props.onAnimationStart;
      _this.setState({
        isAnimationFinished: false
      });
      if (isFunction(onAnimationStart)) {
        onAnimationStart();
      }
    });
    return _this;
  }
  _inherits$2(Area2, _PureComponent);
  return _createClass$2(Area2, [{
    key: "renderDots",
    value: function renderDots(needClip, clipDot, clipPathId) {
      var isAnimationActive = this.props.isAnimationActive;
      var isAnimationFinished = this.state.isAnimationFinished;
      if (isAnimationActive && !isAnimationFinished) {
        return null;
      }
      var _this$props = this.props, dot = _this$props.dot, points = _this$props.points, dataKey = _this$props.dataKey;
      var areaProps = filterProps(this.props, false);
      var customDotProps = filterProps(dot, true);
      var dots = points.map(function(entry, i) {
        var dotProps = _objectSpread$1(_objectSpread$1(_objectSpread$1({
          key: "dot-".concat(i),
          r: 3
        }, areaProps), customDotProps), {}, {
          index: i,
          cx: entry.x,
          cy: entry.y,
          dataKey,
          value: entry.value,
          payload: entry.payload,
          points
        });
        return Area2.renderDotItem(dot, dotProps);
      });
      var dotsProps = {
        clipPath: needClip ? "url(#clipPath-".concat(clipDot ? "" : "dots-").concat(clipPathId, ")") : null
      };
      return /* @__PURE__ */ React.createElement(Layer, _extends$2({
        className: "recharts-area-dots"
      }, dotsProps), dots);
    }
  }, {
    key: "renderHorizontalRect",
    value: function renderHorizontalRect(alpha) {
      var _this$props2 = this.props, baseLine = _this$props2.baseLine, points = _this$props2.points, strokeWidth = _this$props2.strokeWidth;
      var startX = points[0].x;
      var endX = points[points.length - 1].x;
      var width = alpha * Math.abs(startX - endX);
      var maxY = max(points.map(function(entry) {
        return entry.y || 0;
      }));
      if (isNumber(baseLine) && typeof baseLine === "number") {
        maxY = Math.max(baseLine, maxY);
      } else if (baseLine && Array.isArray(baseLine) && baseLine.length) {
        maxY = Math.max(max(baseLine.map(function(entry) {
          return entry.y || 0;
        })), maxY);
      }
      if (isNumber(maxY)) {
        return /* @__PURE__ */ React.createElement("rect", {
          x: startX < endX ? startX : startX - width,
          y: 0,
          width,
          height: Math.floor(maxY + (strokeWidth ? parseInt("".concat(strokeWidth), 10) : 1))
        });
      }
      return null;
    }
  }, {
    key: "renderVerticalRect",
    value: function renderVerticalRect(alpha) {
      var _this$props3 = this.props, baseLine = _this$props3.baseLine, points = _this$props3.points, strokeWidth = _this$props3.strokeWidth;
      var startY = points[0].y;
      var endY = points[points.length - 1].y;
      var height = alpha * Math.abs(startY - endY);
      var maxX = max(points.map(function(entry) {
        return entry.x || 0;
      }));
      if (isNumber(baseLine) && typeof baseLine === "number") {
        maxX = Math.max(baseLine, maxX);
      } else if (baseLine && Array.isArray(baseLine) && baseLine.length) {
        maxX = Math.max(max(baseLine.map(function(entry) {
          return entry.x || 0;
        })), maxX);
      }
      if (isNumber(maxX)) {
        return /* @__PURE__ */ React.createElement("rect", {
          x: 0,
          y: startY < endY ? startY : startY - height,
          width: maxX + (strokeWidth ? parseInt("".concat(strokeWidth), 10) : 1),
          height: Math.floor(height)
        });
      }
      return null;
    }
  }, {
    key: "renderClipRect",
    value: function renderClipRect(alpha) {
      var layout = this.props.layout;
      if (layout === "vertical") {
        return this.renderVerticalRect(alpha);
      }
      return this.renderHorizontalRect(alpha);
    }
  }, {
    key: "renderAreaStatically",
    value: function renderAreaStatically(points, baseLine, needClip, clipPathId) {
      var _this$props4 = this.props, layout = _this$props4.layout, type = _this$props4.type, stroke = _this$props4.stroke, connectNulls = _this$props4.connectNulls, isRange = _this$props4.isRange;
      _this$props4.ref;
      var others = _objectWithoutProperties$1(_this$props4, _excluded$1);
      return /* @__PURE__ */ React.createElement(Layer, {
        clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null
      }, /* @__PURE__ */ React.createElement(Curve, _extends$2({}, filterProps(others, true), {
        points,
        connectNulls,
        type,
        baseLine,
        layout,
        stroke: "none",
        className: "recharts-area-area"
      })), stroke !== "none" && /* @__PURE__ */ React.createElement(Curve, _extends$2({}, filterProps(this.props, false), {
        className: "recharts-area-curve",
        layout,
        type,
        connectNulls,
        fill: "none",
        points
      })), stroke !== "none" && isRange && /* @__PURE__ */ React.createElement(Curve, _extends$2({}, filterProps(this.props, false), {
        className: "recharts-area-curve",
        layout,
        type,
        connectNulls,
        fill: "none",
        points: baseLine
      })));
    }
  }, {
    key: "renderAreaWithAnimation",
    value: function renderAreaWithAnimation(needClip, clipPathId) {
      var _this2 = this;
      var _this$props5 = this.props, points = _this$props5.points, baseLine = _this$props5.baseLine, isAnimationActive = _this$props5.isAnimationActive, animationBegin = _this$props5.animationBegin, animationDuration = _this$props5.animationDuration, animationEasing = _this$props5.animationEasing, animationId = _this$props5.animationId;
      var _this$state = this.state, prevPoints = _this$state.prevPoints, prevBaseLine = _this$state.prevBaseLine;
      return /* @__PURE__ */ React.createElement(Animate, {
        begin: animationBegin,
        duration: animationDuration,
        isActive: isAnimationActive,
        easing: animationEasing,
        from: {
          t: 0
        },
        to: {
          t: 1
        },
        key: "area-".concat(animationId),
        onAnimationEnd: this.handleAnimationEnd,
        onAnimationStart: this.handleAnimationStart
      }, function(_ref) {
        var t = _ref.t;
        if (prevPoints) {
          var prevPointsDiffFactor = prevPoints.length / points.length;
          var stepPoints = points.map(function(entry, index) {
            var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
            if (prevPoints[prevPointIndex]) {
              var prev = prevPoints[prevPointIndex];
              var interpolatorX = interpolateNumber(prev.x, entry.x);
              var interpolatorY = interpolateNumber(prev.y, entry.y);
              return _objectSpread$1(_objectSpread$1({}, entry), {}, {
                x: interpolatorX(t),
                y: interpolatorY(t)
              });
            }
            return entry;
          });
          var stepBaseLine;
          if (isNumber(baseLine) && typeof baseLine === "number") {
            var interpolator = interpolateNumber(prevBaseLine, baseLine);
            stepBaseLine = interpolator(t);
          } else if (isNil(baseLine) || isNan(baseLine)) {
            var _interpolator = interpolateNumber(prevBaseLine, 0);
            stepBaseLine = _interpolator(t);
          } else {
            stepBaseLine = baseLine.map(function(entry, index) {
              var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
              if (prevBaseLine[prevPointIndex]) {
                var prev = prevBaseLine[prevPointIndex];
                var interpolatorX = interpolateNumber(prev.x, entry.x);
                var interpolatorY = interpolateNumber(prev.y, entry.y);
                return _objectSpread$1(_objectSpread$1({}, entry), {}, {
                  x: interpolatorX(t),
                  y: interpolatorY(t)
                });
              }
              return entry;
            });
          }
          return _this2.renderAreaStatically(stepPoints, stepBaseLine, needClip, clipPathId);
        }
        return /* @__PURE__ */ React.createElement(Layer, null, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", {
          id: "animationClipPath-".concat(clipPathId)
        }, _this2.renderClipRect(t))), /* @__PURE__ */ React.createElement(Layer, {
          clipPath: "url(#animationClipPath-".concat(clipPathId, ")")
        }, _this2.renderAreaStatically(points, baseLine, needClip, clipPathId)));
      });
    }
  }, {
    key: "renderArea",
    value: function renderArea(needClip, clipPathId) {
      var _this$props6 = this.props, points = _this$props6.points, baseLine = _this$props6.baseLine, isAnimationActive = _this$props6.isAnimationActive;
      var _this$state2 = this.state, prevPoints = _this$state2.prevPoints, prevBaseLine = _this$state2.prevBaseLine, totalLength = _this$state2.totalLength;
      if (isAnimationActive && points && points.length && (!prevPoints && totalLength > 0 || !isEqual(prevPoints, points) || !isEqual(prevBaseLine, baseLine))) {
        return this.renderAreaWithAnimation(needClip, clipPathId);
      }
      return this.renderAreaStatically(points, baseLine, needClip, clipPathId);
    }
  }, {
    key: "render",
    value: function render() {
      var _filterProps;
      var _this$props7 = this.props, hide = _this$props7.hide, dot = _this$props7.dot, points = _this$props7.points, className = _this$props7.className, top = _this$props7.top, left = _this$props7.left, xAxis = _this$props7.xAxis, yAxis = _this$props7.yAxis, width = _this$props7.width, height = _this$props7.height, isAnimationActive = _this$props7.isAnimationActive, id = _this$props7.id;
      if (hide || !points || !points.length) {
        return null;
      }
      var isAnimationFinished = this.state.isAnimationFinished;
      var hasSinglePoint = points.length === 1;
      var layerClass = clsx("recharts-area", className);
      var needClipX = xAxis && xAxis.allowDataOverflow;
      var needClipY = yAxis && yAxis.allowDataOverflow;
      var needClip = needClipX || needClipY;
      var clipPathId = isNil(id) ? this.id : id;
      var _ref2 = (_filterProps = filterProps(dot, false)) !== null && _filterProps !== void 0 ? _filterProps : {
        r: 3,
        strokeWidth: 2
      }, _ref2$r = _ref2.r, r = _ref2$r === void 0 ? 3 : _ref2$r, _ref2$strokeWidth = _ref2.strokeWidth, strokeWidth = _ref2$strokeWidth === void 0 ? 2 : _ref2$strokeWidth;
      var _ref3 = hasClipDot(dot) ? dot : {}, _ref3$clipDot = _ref3.clipDot, clipDot = _ref3$clipDot === void 0 ? true : _ref3$clipDot;
      var dotSize = r * 2 + strokeWidth;
      return /* @__PURE__ */ React.createElement(Layer, {
        className: layerClass
      }, needClipX || needClipY ? /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", {
        id: "clipPath-".concat(clipPathId)
      }, /* @__PURE__ */ React.createElement("rect", {
        x: needClipX ? left : left - width / 2,
        y: needClipY ? top : top - height / 2,
        width: needClipX ? width : width * 2,
        height: needClipY ? height : height * 2
      })), !clipDot && /* @__PURE__ */ React.createElement("clipPath", {
        id: "clipPath-dots-".concat(clipPathId)
      }, /* @__PURE__ */ React.createElement("rect", {
        x: left - dotSize / 2,
        y: top - dotSize / 2,
        width: width + dotSize,
        height: height + dotSize
      }))) : null, !hasSinglePoint ? this.renderArea(needClip, clipPathId) : null, (dot || hasSinglePoint) && this.renderDots(needClip, clipDot, clipPathId), (!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, points));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.animationId !== prevState.prevAnimationId) {
        return {
          prevAnimationId: nextProps.animationId,
          curPoints: nextProps.points,
          curBaseLine: nextProps.baseLine,
          prevPoints: prevState.curPoints,
          prevBaseLine: prevState.curBaseLine
        };
      }
      if (nextProps.points !== prevState.curPoints || nextProps.baseLine !== prevState.curBaseLine) {
        return {
          curPoints: nextProps.points,
          curBaseLine: nextProps.baseLine
        };
      }
      return null;
    }
  }]);
}(reactExports.PureComponent);
_Area = Area;
_defineProperty$2(Area, "displayName", "Area");
_defineProperty$2(Area, "defaultProps", {
  stroke: "#3182bd",
  fill: "#3182bd",
  fillOpacity: 0.6,
  xAxisId: 0,
  yAxisId: 0,
  legendType: "line",
  connectNulls: false,
  // points of area
  points: [],
  dot: false,
  activeDot: true,
  hide: false,
  isAnimationActive: !Global.isSsr,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: "ease"
});
_defineProperty$2(Area, "getBaseValue", function(props, item, xAxis, yAxis) {
  var layout = props.layout, chartBaseValue = props.baseValue;
  var itemBaseValue = item.props.baseValue;
  var baseValue = itemBaseValue !== null && itemBaseValue !== void 0 ? itemBaseValue : chartBaseValue;
  if (isNumber(baseValue) && typeof baseValue === "number") {
    return baseValue;
  }
  var numericAxis = layout === "horizontal" ? yAxis : xAxis;
  var domain = numericAxis.scale.domain();
  if (numericAxis.type === "number") {
    var domainMax = Math.max(domain[0], domain[1]);
    var domainMin = Math.min(domain[0], domain[1]);
    if (baseValue === "dataMin") {
      return domainMin;
    }
    if (baseValue === "dataMax") {
      return domainMax;
    }
    return domainMax < 0 ? domainMax : Math.max(Math.min(domain[0], domain[1]), 0);
  }
  if (baseValue === "dataMin") {
    return domain[0];
  }
  if (baseValue === "dataMax") {
    return domain[1];
  }
  return domain[0];
});
_defineProperty$2(Area, "getComposedData", function(_ref4) {
  var props = _ref4.props, item = _ref4.item, xAxis = _ref4.xAxis, yAxis = _ref4.yAxis, xAxisTicks = _ref4.xAxisTicks, yAxisTicks = _ref4.yAxisTicks, bandSize = _ref4.bandSize, dataKey = _ref4.dataKey, stackedData = _ref4.stackedData, dataStartIndex = _ref4.dataStartIndex, displayedData = _ref4.displayedData, offset = _ref4.offset;
  var layout = props.layout;
  var hasStack = stackedData && stackedData.length;
  var baseValue = _Area.getBaseValue(props, item, xAxis, yAxis);
  var isHorizontalLayout = layout === "horizontal";
  var isRange = false;
  var points = displayedData.map(function(entry, index) {
    var value;
    if (hasStack) {
      value = stackedData[dataStartIndex + index];
    } else {
      value = getValueByDataKey(entry, dataKey);
      if (!Array.isArray(value)) {
        value = [baseValue, value];
      } else {
        isRange = true;
      }
    }
    var isBreakPoint = value[1] == null || hasStack && getValueByDataKey(entry, dataKey) == null;
    if (isHorizontalLayout) {
      return {
        x: getCateCoordinateOfLine({
          axis: xAxis,
          ticks: xAxisTicks,
          bandSize,
          entry,
          index
        }),
        y: isBreakPoint ? null : yAxis.scale(value[1]),
        value,
        payload: entry
      };
    }
    return {
      x: isBreakPoint ? null : xAxis.scale(value[1]),
      y: getCateCoordinateOfLine({
        axis: yAxis,
        ticks: yAxisTicks,
        bandSize,
        entry,
        index
      }),
      value,
      payload: entry
    };
  });
  var baseLine;
  if (hasStack || isRange) {
    baseLine = points.map(function(entry) {
      var x = Array.isArray(entry.value) ? entry.value[0] : null;
      if (isHorizontalLayout) {
        return {
          x: entry.x,
          y: x != null && entry.y != null ? yAxis.scale(x) : null
        };
      }
      return {
        x: x != null ? xAxis.scale(x) : null,
        y: entry.y
      };
    });
  } else {
    baseLine = isHorizontalLayout ? yAxis.scale(baseValue) : xAxis.scale(baseValue);
  }
  return _objectSpread$1({
    points,
    baseLine,
    layout,
    isRange
  }, offset);
});
_defineProperty$2(Area, "renderDotItem", function(option, props) {
  var dotItem;
  if (/* @__PURE__ */ React.isValidElement(option)) {
    dotItem = /* @__PURE__ */ React.cloneElement(option, props);
  } else if (isFunction(option)) {
    dotItem = option(props);
  } else {
    var className = clsx("recharts-area-dot", typeof option !== "boolean" ? option.className : "");
    var key = props.key, rest = _objectWithoutProperties$1(props, _excluded2);
    dotItem = /* @__PURE__ */ React.createElement(Dot, _extends$2({}, rest, {
      key,
      className
    }));
  }
  return dotItem;
});
function _typeof$1(o) {
  "@babel/helpers - typeof";
  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof$1(o);
}
function _classCallCheck$1(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties$1(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey$1(descriptor.key), descriptor);
  }
}
function _createClass$1(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _callSuper$1(t, o, e) {
  return o = _getPrototypeOf$1(o), _possibleConstructorReturn$1(t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf$1(t).constructor) : o.apply(t, e));
}
function _possibleConstructorReturn$1(self, call) {
  if (call && (_typeof$1(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized$1(self);
}
function _assertThisInitialized$1(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _isNativeReflectConstruct$1() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct2() {
    return !!t;
  })();
}
function _getPrototypeOf$1(o) {
  _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf$1(o);
}
function _inherits$1(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf$1(subClass, superClass);
}
function _setPrototypeOf$1(o, p) {
  _setPrototypeOf$1 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf$1(o, p);
}
function _defineProperty$1(obj, key, value) {
  key = _toPropertyKey$1(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey$1(t) {
  var i = _toPrimitive$1(t, "string");
  return "symbol" == _typeof$1(i) ? i : i + "";
}
function _toPrimitive$1(t, r) {
  if ("object" != _typeof$1(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != _typeof$1(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var ZAxis = /* @__PURE__ */ function(_React$Component) {
  function ZAxis2() {
    _classCallCheck$1(this, ZAxis2);
    return _callSuper$1(this, ZAxis2, arguments);
  }
  _inherits$1(ZAxis2, _React$Component);
  return _createClass$1(ZAxis2, [{
    key: "render",
    value: function render() {
      return null;
    }
  }]);
}(reactExports.Component);
_defineProperty$1(ZAxis, "displayName", "ZAxis");
_defineProperty$1(ZAxis, "defaultProps", {
  zAxisId: 0,
  range: [64, 64],
  scale: "auto",
  type: "number"
});
var _excluded = ["option", "isActive"];
function _extends$1() {
  _extends$1 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$1.apply(this, arguments);
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function ScatterSymbol(_ref) {
  var option = _ref.option, isActive = _ref.isActive, props = _objectWithoutProperties(_ref, _excluded);
  if (typeof option === "string") {
    return /* @__PURE__ */ reactExports.createElement(Shape, _extends$1({
      option: /* @__PURE__ */ reactExports.createElement(Symbols, _extends$1({
        type: option
      }, props)),
      isActive,
      shapeType: "symbols"
    }, props));
  }
  return /* @__PURE__ */ reactExports.createElement(Shape, _extends$1({
    option,
    isActive,
    shapeType: "symbols"
  }, props));
}
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", { writable: false });
  return Constructor;
}
function _callSuper(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _isNativeReflectConstruct() {
  try {
    var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t2) {
  }
  return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
    return !!t;
  })();
}
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
    return o2.__proto__ || Object.getPrototypeOf(o2);
  };
  return _getPrototypeOf(o);
}
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
  Object.defineProperty(subClass, "prototype", { writable: false });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
    o2.__proto__ = p2;
    return o2;
  };
  return _setPrototypeOf(o, p);
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Scatter = /* @__PURE__ */ function(_PureComponent) {
  function Scatter2() {
    var _this;
    _classCallCheck(this, Scatter2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Scatter2, [].concat(args));
    _defineProperty(_this, "state", {
      isAnimationFinished: false
    });
    _defineProperty(_this, "handleAnimationEnd", function() {
      _this.setState({
        isAnimationFinished: true
      });
    });
    _defineProperty(_this, "handleAnimationStart", function() {
      _this.setState({
        isAnimationFinished: false
      });
    });
    _defineProperty(_this, "id", uniqueId("recharts-scatter-"));
    return _this;
  }
  _inherits(Scatter2, _PureComponent);
  return _createClass(Scatter2, [{
    key: "renderSymbolsStatically",
    value: function renderSymbolsStatically(points) {
      var _this2 = this;
      var _this$props = this.props, shape = _this$props.shape, activeShape = _this$props.activeShape, activeIndex = _this$props.activeIndex;
      var baseProps = filterProps(this.props, false);
      return points.map(function(entry, i) {
        var isActive = activeIndex === i;
        var option = isActive ? activeShape : shape;
        var props = _objectSpread(_objectSpread({}, baseProps), entry);
        return /* @__PURE__ */ React.createElement(Layer, _extends({
          className: "recharts-scatter-symbol",
          key: "symbol-".concat(entry === null || entry === void 0 ? void 0 : entry.cx, "-").concat(entry === null || entry === void 0 ? void 0 : entry.cy, "-").concat(entry === null || entry === void 0 ? void 0 : entry.size, "-").concat(i)
        }, adaptEventsOfChild(_this2.props, entry, i), {
          role: "img"
        }), /* @__PURE__ */ React.createElement(ScatterSymbol, _extends({
          option,
          isActive,
          key: "symbol-".concat(i)
        }, props)));
      });
    }
  }, {
    key: "renderSymbolsWithAnimation",
    value: function renderSymbolsWithAnimation() {
      var _this3 = this;
      var _this$props2 = this.props, points = _this$props2.points, isAnimationActive = _this$props2.isAnimationActive, animationBegin = _this$props2.animationBegin, animationDuration = _this$props2.animationDuration, animationEasing = _this$props2.animationEasing, animationId = _this$props2.animationId;
      var prevPoints = this.state.prevPoints;
      return /* @__PURE__ */ React.createElement(Animate, {
        begin: animationBegin,
        duration: animationDuration,
        isActive: isAnimationActive,
        easing: animationEasing,
        from: {
          t: 0
        },
        to: {
          t: 1
        },
        key: "pie-".concat(animationId),
        onAnimationEnd: this.handleAnimationEnd,
        onAnimationStart: this.handleAnimationStart
      }, function(_ref) {
        var t = _ref.t;
        var stepData = points.map(function(entry, index) {
          var prev = prevPoints && prevPoints[index];
          if (prev) {
            var interpolatorCx = interpolateNumber(prev.cx, entry.cx);
            var interpolatorCy = interpolateNumber(prev.cy, entry.cy);
            var interpolatorSize = interpolateNumber(prev.size, entry.size);
            return _objectSpread(_objectSpread({}, entry), {}, {
              cx: interpolatorCx(t),
              cy: interpolatorCy(t),
              size: interpolatorSize(t)
            });
          }
          var interpolator = interpolateNumber(0, entry.size);
          return _objectSpread(_objectSpread({}, entry), {}, {
            size: interpolator(t)
          });
        });
        return /* @__PURE__ */ React.createElement(Layer, null, _this3.renderSymbolsStatically(stepData));
      });
    }
  }, {
    key: "renderSymbols",
    value: function renderSymbols() {
      var _this$props3 = this.props, points = _this$props3.points, isAnimationActive = _this$props3.isAnimationActive;
      var prevPoints = this.state.prevPoints;
      if (isAnimationActive && points && points.length && (!prevPoints || !isEqual(prevPoints, points))) {
        return this.renderSymbolsWithAnimation();
      }
      return this.renderSymbolsStatically(points);
    }
  }, {
    key: "renderErrorBar",
    value: function renderErrorBar() {
      var isAnimationActive = this.props.isAnimationActive;
      if (isAnimationActive && !this.state.isAnimationFinished) {
        return null;
      }
      var _this$props4 = this.props, points = _this$props4.points, xAxis = _this$props4.xAxis, yAxis = _this$props4.yAxis, children = _this$props4.children;
      var errorBarItems = findAllByType(children, ErrorBar);
      if (!errorBarItems) {
        return null;
      }
      return errorBarItems.map(function(item, i) {
        var _item$props = item.props, direction = _item$props.direction, errorDataKey = _item$props.dataKey;
        return /* @__PURE__ */ React.cloneElement(item, {
          key: "".concat(direction, "-").concat(errorDataKey, "-").concat(points[i]),
          data: points,
          xAxis,
          yAxis,
          layout: direction === "x" ? "vertical" : "horizontal",
          dataPointFormatter: function dataPointFormatter(dataPoint, dataKey) {
            return {
              x: dataPoint.cx,
              y: dataPoint.cy,
              value: direction === "x" ? +dataPoint.node.x : +dataPoint.node.y,
              errorVal: getValueByDataKey(dataPoint, dataKey)
            };
          }
        });
      });
    }
  }, {
    key: "renderLine",
    value: function renderLine() {
      var _this$props5 = this.props, points = _this$props5.points, line = _this$props5.line, lineType = _this$props5.lineType, lineJointType = _this$props5.lineJointType;
      var scatterProps = filterProps(this.props, false);
      var customLineProps = filterProps(line, false);
      var linePoints, lineItem;
      if (lineType === "joint") {
        linePoints = points.map(function(entry) {
          return {
            x: entry.cx,
            y: entry.cy
          };
        });
      } else if (lineType === "fitting") {
        var _getLinearRegression = getLinearRegression(points), xmin = _getLinearRegression.xmin, xmax = _getLinearRegression.xmax, a = _getLinearRegression.a, b = _getLinearRegression.b;
        var linearExp = function linearExp2(x) {
          return a * x + b;
        };
        linePoints = [{
          x: xmin,
          y: linearExp(xmin)
        }, {
          x: xmax,
          y: linearExp(xmax)
        }];
      }
      var lineProps = _objectSpread(_objectSpread(_objectSpread({}, scatterProps), {}, {
        fill: "none",
        stroke: scatterProps && scatterProps.fill
      }, customLineProps), {}, {
        points: linePoints
      });
      if (/* @__PURE__ */ React.isValidElement(line)) {
        lineItem = /* @__PURE__ */ React.cloneElement(line, lineProps);
      } else if (isFunction(line)) {
        lineItem = line(lineProps);
      } else {
        lineItem = /* @__PURE__ */ React.createElement(Curve, _extends({}, lineProps, {
          type: lineJointType
        }));
      }
      return /* @__PURE__ */ React.createElement(Layer, {
        className: "recharts-scatter-line",
        key: "recharts-scatter-line"
      }, lineItem);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props6 = this.props, hide = _this$props6.hide, points = _this$props6.points, line = _this$props6.line, className = _this$props6.className, xAxis = _this$props6.xAxis, yAxis = _this$props6.yAxis, left = _this$props6.left, top = _this$props6.top, width = _this$props6.width, height = _this$props6.height, id = _this$props6.id, isAnimationActive = _this$props6.isAnimationActive;
      if (hide || !points || !points.length) {
        return null;
      }
      var isAnimationFinished = this.state.isAnimationFinished;
      var layerClass = clsx("recharts-scatter", className);
      var needClipX = xAxis && xAxis.allowDataOverflow;
      var needClipY = yAxis && yAxis.allowDataOverflow;
      var needClip = needClipX || needClipY;
      var clipPathId = isNil(id) ? this.id : id;
      return /* @__PURE__ */ React.createElement(Layer, {
        className: layerClass,
        clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null
      }, needClipX || needClipY ? /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", {
        id: "clipPath-".concat(clipPathId)
      }, /* @__PURE__ */ React.createElement("rect", {
        x: needClipX ? left : left - width / 2,
        y: needClipY ? top : top - height / 2,
        width: needClipX ? width : width * 2,
        height: needClipY ? height : height * 2
      }))) : null, line && this.renderLine(), this.renderErrorBar(), /* @__PURE__ */ React.createElement(Layer, {
        key: "recharts-scatter-symbols"
      }, this.renderSymbols()), (!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, points));
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(nextProps, prevState) {
      if (nextProps.animationId !== prevState.prevAnimationId) {
        return {
          prevAnimationId: nextProps.animationId,
          curPoints: nextProps.points,
          prevPoints: prevState.curPoints
        };
      }
      if (nextProps.points !== prevState.curPoints) {
        return {
          curPoints: nextProps.points
        };
      }
      return null;
    }
  }]);
}(reactExports.PureComponent);
_defineProperty(Scatter, "displayName", "Scatter");
_defineProperty(Scatter, "defaultProps", {
  xAxisId: 0,
  yAxisId: 0,
  zAxisId: 0,
  legendType: "circle",
  lineType: "joint",
  lineJointType: "linear",
  data: [],
  shape: "circle",
  hide: false,
  isAnimationActive: !Global.isSsr,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: "linear"
});
_defineProperty(Scatter, "getComposedData", function(_ref2) {
  var xAxis = _ref2.xAxis, yAxis = _ref2.yAxis, zAxis = _ref2.zAxis, item = _ref2.item, displayedData = _ref2.displayedData, xAxisTicks = _ref2.xAxisTicks, yAxisTicks = _ref2.yAxisTicks, offset = _ref2.offset;
  var tooltipType = item.props.tooltipType;
  var cells = findAllByType(item.props.children, Cell);
  var xAxisDataKey = isNil(xAxis.dataKey) ? item.props.dataKey : xAxis.dataKey;
  var yAxisDataKey = isNil(yAxis.dataKey) ? item.props.dataKey : yAxis.dataKey;
  var zAxisDataKey = zAxis && zAxis.dataKey;
  var defaultRangeZ = zAxis ? zAxis.range : ZAxis.defaultProps.range;
  var defaultZ = defaultRangeZ && defaultRangeZ[0];
  var xBandSize = xAxis.scale.bandwidth ? xAxis.scale.bandwidth() : 0;
  var yBandSize = yAxis.scale.bandwidth ? yAxis.scale.bandwidth() : 0;
  var points = displayedData.map(function(entry, index) {
    var x = getValueByDataKey(entry, xAxisDataKey);
    var y = getValueByDataKey(entry, yAxisDataKey);
    var z = !isNil(zAxisDataKey) && getValueByDataKey(entry, zAxisDataKey) || "-";
    var tooltipPayload = [{
      name: isNil(xAxis.dataKey) ? item.props.name : xAxis.name || xAxis.dataKey,
      unit: xAxis.unit || "",
      value: x,
      payload: entry,
      dataKey: xAxisDataKey,
      type: tooltipType
    }, {
      name: isNil(yAxis.dataKey) ? item.props.name : yAxis.name || yAxis.dataKey,
      unit: yAxis.unit || "",
      value: y,
      payload: entry,
      dataKey: yAxisDataKey,
      type: tooltipType
    }];
    if (z !== "-") {
      tooltipPayload.push({
        name: zAxis.name || zAxis.dataKey,
        unit: zAxis.unit || "",
        value: z,
        payload: entry,
        dataKey: zAxisDataKey,
        type: tooltipType
      });
    }
    var cx = getCateCoordinateOfLine({
      axis: xAxis,
      ticks: xAxisTicks,
      bandSize: xBandSize,
      entry,
      index,
      dataKey: xAxisDataKey
    });
    var cy = getCateCoordinateOfLine({
      axis: yAxis,
      ticks: yAxisTicks,
      bandSize: yBandSize,
      entry,
      index,
      dataKey: yAxisDataKey
    });
    var size = z !== "-" ? zAxis.scale(z) : defaultZ;
    var radius = Math.sqrt(Math.max(size, 0) / Math.PI);
    return _objectSpread(_objectSpread({}, entry), {}, {
      cx,
      cy,
      x: cx - radius,
      y: cy - radius,
      xAxis,
      yAxis,
      zAxis,
      width: 2 * radius,
      height: 2 * radius,
      size,
      node: {
        x,
        y,
        z
      },
      tooltipPayload,
      tooltipPosition: {
        x: cx,
        y: cy
      },
      payload: entry
    }, cells && cells[index] && cells[index].props);
  });
  return _objectSpread({
    points
  }, offset);
});
var ComposedChart = generateCategoricalChart({
  chartName: "ComposedChart",
  GraphicalChild: [Line, Area, Bar, Scatter],
  axisComponents: [{
    axisType: "xAxis",
    AxisComp: XAxis
  }, {
    axisType: "yAxis",
    AxisComp: YAxis
  }, {
    axisType: "zAxis",
    AxisComp: ZAxis
  }],
  formatAxisMap
});
const COLORS = {
  arbeitszeit: "#B3D9FF",
  ferien: "#B3E6C8",
  abwesenheit: "#E8E8E8",
  feiertag: "#FFD6CC",
  sollzeit: "#9CA3AF"
};
function SquareDot(props) {
  const { cx, cy, value } = props;
  if (typeof cx !== "number" || typeof cy !== "number" || !value) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "rect",
    {
      x: cx - 3,
      y: cy - 3,
      width: 6,
      height: 6,
      fill: COLORS.sollzeit,
      stroke: COLORS.sollzeit
    }
  );
}
const CHART_TICK = { fontSize: 11, fill: "oklch(0.5 0.015 220)" };
const TOOLTIP_STYLE$1 = {
  borderRadius: "6px",
  border: "1px solid oklch(0.92 0.02 255)",
  fontSize: 12,
  background: "oklch(1.0 0 0)",
  color: "oklch(0.25 0.02 250)"
};
const LABEL_MAP = {
  istArbeitszeit: "Arbeitszeit",
  istFerien: "Ferien",
  istAbwesenheit: "Abwesenheit",
  istFeiertag: "Feiertag",
  sollzeit: "Sollzeit"
};
function tooltipFormatter(value, name) {
  return [formatHours(value), LABEL_MAP[name] ?? name];
}
function legendFormatter(value) {
  return LABEL_MAP[value] ?? value;
}
function TimeChart({ data, periodType, onBarClick }) {
  function handleBarClick(entry) {
    if (!onBarClick) return;
    const isoDate = entry.dateFrom ?? entry.dateTo ?? "";
    if (!isoDate) return;
    const d = /* @__PURE__ */ new Date(`${isoDate}T12:00:00`);
    onBarClick(d);
  }
  if (periodType === "day") return null;
  const maxValue = Math.max(
    ...data.map(
      (d) => d.istArbeitszeit + d.istFerien + d.istAbwesenheit + d.istFeiertag
    ),
    ...data.map((d) => d.sollzeit),
    1
  );
  const yMax = maxValue * 1.2;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 360, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    ComposedChart,
    {
      data,
      margin: { top: 8, right: 16, bottom: 4, left: -8 },
      "data-ocid": "time-chart",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CartesianGrid,
          {
            strokeDasharray: "3 3",
            stroke: "oklch(0.92 0.02 255)",
            vertical: false
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          XAxis,
          {
            dataKey: "label",
            tick: CHART_TICK,
            axisLine: false,
            tickLine: false,
            interval: "preserveStartEnd"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          YAxis,
          {
            tick: CHART_TICK,
            axisLine: false,
            tickLine: false,
            domain: [0, yMax],
            tickFormatter: (v) => v === 0 ? "0" : `${v.toFixed(1)}h`,
            width: 44
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Tooltip,
          {
            formatter: tooltipFormatter,
            contentStyle: TOOLTIP_STYLE$1,
            labelStyle: { fontWeight: 600, marginBottom: 4 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { formatter: legendFormatter, wrapperStyle: { fontSize: 12 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Bar,
          {
            dataKey: "istArbeitszeit",
            stackId: "ist",
            fill: COLORS.arbeitszeit,
            stroke: "#8EC8F0",
            strokeWidth: 0.5,
            radius: [0, 0, 0, 0],
            maxBarSize: 56,
            "data-ocid": "chart-bar-arbeitszeit",
            onClick: (entry) => handleBarClick(entry),
            style: { cursor: onBarClick ? "pointer" : "default" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Bar,
          {
            dataKey: "istFerien",
            stackId: "ist",
            fill: COLORS.ferien,
            stroke: "#8ECFAE",
            strokeWidth: 0.5,
            maxBarSize: 56,
            onClick: (entry) => handleBarClick(entry),
            style: { cursor: onBarClick ? "pointer" : "default" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Bar,
          {
            dataKey: "istAbwesenheit",
            stackId: "ist",
            fill: COLORS.abwesenheit,
            stroke: "#D0D0D0",
            strokeWidth: 0.5,
            maxBarSize: 56,
            onClick: (entry) => handleBarClick(entry),
            style: { cursor: onBarClick ? "pointer" : "default" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Bar,
          {
            dataKey: "istFeiertag",
            stackId: "ist",
            fill: COLORS.feiertag,
            stroke: "#EEB8AC",
            strokeWidth: 0.5,
            radius: [3, 3, 0, 0],
            maxBarSize: 56,
            onClick: (entry) => handleBarClick(entry),
            style: { cursor: onBarClick ? "pointer" : "default" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            type: "monotone",
            dataKey: "sollzeit",
            stroke: COLORS.sollzeit,
            strokeWidth: 1.5,
            strokeDasharray: "5 5",
            dot: /* @__PURE__ */ jsxRuntimeExports.jsx(SquareDot, {}),
            activeDot: { r: 4 }
          }
        )
      ]
    }
  ) });
}
const toAny$2 = (a) => a;
function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function navigateDate(current, periodType, dir) {
  const d = new Date(current);
  switch (periodType) {
    case "day":
      d.setDate(d.getDate() + dir);
      break;
    case "week":
      d.setDate(d.getDate() + dir * 7);
      break;
    case "month":
      d.setMonth(d.getMonth() + dir);
      break;
    case "year":
      d.setFullYear(d.getFullYear() + dir);
      break;
  }
  return d;
}
function getDateRange(periodType, date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const week = getISOWeekNumber(date);
  const weekYear = getISOWeekYear(date);
  switch (periodType) {
    case "day": {
      const iso = toIso(date);
      return { dateFrom: iso, dateTo: iso, year, month, week };
    }
    case "week": {
      const jan4 = new Date(Date.UTC(weekYear, 0, 4));
      const jan4Dow = jan4.getUTCDay() || 7;
      const mondayUTC = new Date(
        jan4.getTime() - (jan4Dow - 1) * 864e5 + (week - 1) * 7 * 864e5
      );
      const mon = new Date(
        mondayUTC.getUTCFullYear(),
        mondayUTC.getUTCMonth(),
        mondayUTC.getUTCDate()
      );
      const sun = new Date(mon);
      sun.setDate(sun.getDate() + 6);
      return {
        dateFrom: toIso(mon),
        dateTo: toIso(sun),
        year: weekYear,
        month,
        week
      };
    }
    case "month": {
      const lastDay = new Date(year, month, 0).getDate();
      const dateFrom = `${year}-${String(month).padStart(2, "0")}-01`;
      const dateTo = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      return { dateFrom, dateTo, year, month, week };
    }
    case "year":
      return {
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
        year,
        month,
        week
      };
  }
}
function TimeOverviewDashboard({
  employeeId,
  companyId,
  employments
}) {
  const { actor, isFetching } = useActor(createActor);
  const { role } = useAuth();
  const isAdminOrManager = role === "admin" || role === "manager";
  const [periodType, setPeriodType] = React.useState("year");
  const [currentDate, setCurrentDate] = React.useState(() => /* @__PURE__ */ new Date());
  const [selectedEmpId, setSelectedEmpId] = React.useState(
    () => employeeId ? String(employeeId) : ""
  );
  React.useEffect(() => {
    if (employeeId && !selectedEmpId) {
      setSelectedEmpId(String(employeeId));
    }
  }, [employeeId, selectedEmpId]);
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-time-overview"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny$2(actor).listEmployees();
    },
    enabled: !!actor && !isFetching && isAdminOrManager,
    staleTime: 6e4
  });
  const targetEmpId = React.useMemo(() => {
    if (isAdminOrManager && selectedEmpId) {
      try {
        return BigInt(selectedEmpId);
      } catch {
        return null;
      }
    }
    return employeeId ?? null;
  }, [isAdminOrManager, selectedEmpId, employeeId]);
  const { dateFrom, dateTo, year, month, week } = getDateRange(
    periodType,
    currentDate
  );
  const { data: projects = [] } = useQuery({
    queryKey: ["projects-for-time-overview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await toAny$2(actor).listProjects();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 12e4
  });
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["serviceTypes-for-time-overview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await toAny$2(actor).listServiceTypes();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 12e4
  });
  const { data: absenceTypes = [] } = useQuery({
    queryKey: ["absenceTypes-overview"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await toAny$2(actor).listAbsenceTypes();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 12e4
  });
  const { data: timeEntries = [], isLoading: loadingTE } = useQuery({
    queryKey: ["timeEntries-overview", String(targetEmpId), dateFrom, dateTo],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        return await toAny$2(actor).listTimeEntries({
          employeeId: targetEmpId,
          dateFrom,
          dateTo
        });
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 3e4
  });
  const { data: absences = [], isLoading: loadingAbs } = useQuery({
    queryKey: ["absences-overview", String(targetEmpId), dateFrom, dateTo],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        return await toAny$2(actor).listAbsences({
          employeeId: targetEmpId,
          dateFrom,
          dateTo
        });
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 3e4
  });
  const { data: holidays = [], isLoading: loadingHol } = useQuery({
    queryKey: ["holidays-overview", String(companyId), year],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await toAny$2(actor).listHolidays();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 12e4
  });
  const { data: targetEmployments = [], isLoading: loadingEmpl } = useQuery({
    queryKey: ["employments-for-time-overview", String(targetEmpId)],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        const res = await toAny$2(actor).listEmployments(targetEmpId);
        const r = res;
        return r.__kind__ === "ok" ? r.ok ?? [] : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId && isAdminOrManager && !!selectedEmpId && selectedEmpId !== String(employeeId),
    staleTime: 6e4
  });
  const effectiveEmployments = isAdminOrManager && selectedEmpId && selectedEmpId !== String(employeeId) ? targetEmployments : employments;
  const isLoading = loadingTE || loadingAbs || loadingHol || loadingEmpl;
  const periodData = React.useMemo(() => {
    switch (periodType) {
      case "year":
        return aggregateForYear(
          timeEntries,
          absences,
          absenceTypes,
          holidays,
          effectiveEmployments,
          year
        );
      case "month":
        return aggregateForMonth(
          timeEntries,
          absences,
          absenceTypes,
          holidays,
          effectiveEmployments,
          year,
          month
        );
      case "week":
        return aggregateForWeek(
          timeEntries,
          absences,
          absenceTypes,
          holidays,
          effectiveEmployments,
          year,
          week
        );
      default:
        return [];
    }
  }, [
    periodType,
    timeEntries,
    absences,
    absenceTypes,
    holidays,
    effectiveEmployments,
    year,
    month,
    week
  ]);
  const projectNamesMap = React.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const p of projects) m.set(String(p.id), p.name);
    return m;
  }, [projects]);
  const serviceTypeNamesMap = React.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    for (const st of serviceTypes) m.set(String(st.id), st.name);
    return m;
  }, [serviceTypes]);
  const dayData = React.useMemo(() => {
    if (periodType !== "day") return [];
    return aggregateForDay(
      timeEntries,
      absences,
      absenceTypes,
      holidays,
      effectiveEmployments,
      dateFrom,
      projectNamesMap,
      serviceTypeNamesMap
    );
  }, [
    periodType,
    timeEntries,
    absences,
    absenceTypes,
    holidays,
    effectiveEmployments,
    dateFrom,
    projectNamesMap,
    serviceTypeNamesMap
  ]);
  const daySollzeit = React.useMemo(() => {
    if (periodType !== "day") return 0;
    return calcSollzeitForDateRange(effectiveEmployments, dateFrom, dateTo);
  }, [periodType, effectiveEmployments, dateFrom, dateTo]);
  const handlePrev = () => setCurrentDate((d) => navigateDate(d, periodType, -1));
  const handleNext = () => setCurrentDate((d) => navigateDate(d, periodType, 1));
  const periodLabel = formatPeriodLabel(periodType, currentDate);
  function handleBarClick(date) {
    switch (periodType) {
      case "year":
        setCurrentDate(date);
        setPeriodType("month");
        break;
      case "month":
        setCurrentDate(date);
        setPeriodType("week");
        break;
      case "week":
        setCurrentDate(date);
        setPeriodType("day");
        break;
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-card rounded-lg shadow-sm border border-border p-5 space-y-4",
      "data-ocid": "time-overview-dashboard",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-semibold text-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 h-5 bg-primary rounded-full inline-block" }),
            "Zeitübersicht"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            isAdminOrManager && employees.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: selectedEmpId,
                onValueChange: (v) => setSelectedEmpId(v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "w-48 h-8 text-xs",
                      "data-ocid": "time-overview-employee-select",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Mitarbeiter wählen" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(emp.id), children: [
                    emp.firstName,
                    " ",
                    emp.lastName
                  ] }, String(emp.id))) })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExportMenu, {})
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodSelector, { value: periodType, onChange: setPeriodType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PeriodNavigator,
            {
              label: periodLabel,
              onPrev: handlePrev,
              onNext: handleNext
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-[200px]", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", "data-ocid": "time-overview.loading_state", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" })
        ] }) : periodType === "day" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          DayDetailView,
          {
            dayData,
            sollzeit: daySollzeit,
            isoDate: dateFrom,
            employeeId: targetEmpId ?? void 0
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          TimeChart,
          {
            data: periodData,
            periodType,
            onBarClick: handleBarClick
          }
        ) })
      ]
    }
  );
}
const toAny$1 = (a) => a;
function useDashboardStats() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated, companyId } = useAuth();
  return useQuery({
    queryKey: ["dashboardStats", companyId],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await toAny$1(actor).getDashboardStats();
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated && !!companyId,
    staleTime: 3e4,
    refetchInterval: 6e4
  });
}
const toAny = (a) => a;
const CHART_STYLE = {
  fontSize: 12,
  fill: "oklch(0.5 0.015 220)"
};
const TOOLTIP_STYLE = {
  borderRadius: "6px",
  border: "1px solid oklch(0.92 0.02 255)",
  fontSize: 12,
  background: "oklch(1.0 0 0)",
  color: "oklch(0.25 0.02 250)"
};
function isoToDe(iso) {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function endOfWeekIso(date, _tz) {
  const d = new Date(date);
  const dow = d.getDay();
  const daysToSunday = dow === 0 ? 0 : 7 - dow;
  d.setDate(d.getDate() + daysToSunday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function FeriensaldoWidget() {
  const { employeeId, role } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const isAdminOrManager = role === "admin" || role === "manager";
  const [selectedEmpId, setSelectedEmpId] = reactExports.useState(
    () => employeeId ? String(employeeId) : ""
  );
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-feriensaldo"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listEmployees();
    },
    enabled: !!actor && !isFetching && isAdminOrManager,
    staleTime: 6e4
  });
  const targetEmpId = isAdminOrManager && selectedEmpId ? selectedEmpId : employeeId ? String(employeeId) : null;
  const { data: vacationBalances, isLoading: loadingBalances } = useQuery({
    queryKey: ["vacationBalances-dashboard", String(targetEmpId)],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        const res = await toAny(actor).listVacationBalances(
          BigInt(targetEmpId)
        );
        const r = res;
        return r.__kind__ === "ok" ? r.ok ?? [] : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 6e4
  });
  const { data: employments = [], isLoading: loadingEmployments } = useQuery({
    queryKey: ["employments-feriensaldo", String(targetEmpId)],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        const res = await toAny(actor).listEmployments(BigInt(targetEmpId));
        const r = res;
        return r.__kind__ === "ok" ? r.ok ?? [] : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 6e4
  });
  const { data: absenceData, isLoading: loadingAbsences } = useQuery({
    queryKey: ["vacation-absences-dashboard", String(targetEmpId)],
    queryFn: async () => {
      if (!actor || !targetEmpId) return { absences: [] };
      try {
        const [absencesRes, typesRes] = await Promise.all([
          toAny(actor).listAbsences({
            status: "approved",
            employeeId: BigInt(targetEmpId)
          }),
          toAny(actor).listAbsenceTypes()
        ]);
        const vacTypeIds = new Set(
          (typesRes ?? []).filter((t) => t.name === "Ferien").map((t) => String(t.id))
        );
        const filtered = (absencesRes ?? []).filter(
          (a) => vacTypeIds.has(String(a.absenceTypeId)) && a.status === "approved" && String(a.employeeId) === String(targetEmpId)
        );
        return { absences: filtered };
      } catch {
        return { absences: [] };
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 6e4
  });
  const isLoading = loadingBalances || loadingAbsences || loadingEmployments;
  const totalGrantedDays = (vacationBalances ?? []).filter((b) => Number(b.kalenderjahr) === currentYear).reduce((sum, b) => sum + Number(b.dauer) / 100, 0);
  const usedDays = ((absenceData == null ? void 0 : absenceData.absences) ?? []).reduce((sum, a) => {
    const yearFrom = (/* @__PURE__ */ new Date(`${a.dateFrom}T12:00:00`)).getFullYear();
    const yearTo = (/* @__PURE__ */ new Date(`${a.dateTo}T12:00:00`)).getFullYear();
    if (yearFrom !== currentYear && yearTo !== currentYear) return sum;
    const effectiveFrom = yearFrom < currentYear ? `${currentYear}-01-01` : a.dateFrom;
    const effectiveTo = yearTo > currentYear ? `${currentYear}-12-31` : a.dateTo;
    return sum + countVacationDaysProportional(
      effectiveFrom,
      effectiveTo,
      a.ganztaetig,
      Number(a.dauer),
      employments
    );
  }, 0);
  const usedDaysRounded = Math.round(usedDays * 10) / 10;
  const remainingDays = Math.max(totalGrantedDays - usedDays, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", "data-ocid": "feriensaldo-widget", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-4 h-4 text-amber-500" }),
        "Feriensaldo ",
        currentYear
      ] }),
      isAdminOrManager && employees.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: selectedEmpId,
          onValueChange: (v) => setSelectedEmpId(v),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectTrigger,
              {
                className: "w-48 h-8 text-xs",
                "data-ocid": "feriensaldo-employee-select",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Mitarbeiter wählen" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(emp.id), children: [
              emp.firstName,
              " ",
              emp.lastName
            ] }, String(emp.id))) })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SaldoKpi,
          {
            label: "Gutschriften",
            value: `${totalGrantedDays.toFixed(totalGrantedDays % 1 === 0 ? 0 : 1)} T`,
            colorClass: "bg-muted/50",
            textColorClass: "text-foreground"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SaldoKpi,
          {
            label: "Bezogen",
            value: `${usedDaysRounded} T`,
            colorClass: "bg-amber-50 dark:bg-amber-950/30",
            textColorClass: "text-amber-700 dark:text-amber-400"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SaldoKpi,
          {
            label: "Verbleibend",
            value: `${remainingDays.toFixed(remainingDays % 1 === 0 ? 0 : 1)} T`,
            colorClass: "bg-emerald-50 dark:bg-emerald-950/30",
            textColorClass: "text-emerald-700 dark:text-emerald-400"
          }
        )
      ] }),
      !isLoading && totalGrantedDays === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-3 pl-1", children: [
        "Kein Ferienguthaben für ",
        currentYear,
        " erfasst."
      ] })
    ] })
  ] });
}
function ArbeitszeitsaldoWidget() {
  const { employeeId, role } = useAuth();
  const { actor, isFetching } = useActor(createActor);
  useCompanyTimezone();
  const isAdminOrManager = role === "admin" || role === "manager";
  const [selectedEmpId, setSelectedEmpId] = reactExports.useState(
    () => employeeId ? String(employeeId) : ""
  );
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-saldo"],
    queryFn: async () => {
      if (!actor) return [];
      return toAny(actor).listEmployees();
    },
    enabled: !!actor && !isFetching && isAdminOrManager,
    staleTime: 6e4
  });
  const targetEmpId = isAdminOrManager && selectedEmpId ? selectedEmpId : employeeId ? String(employeeId) : null;
  const { data: employments = [] } = useQuery({
    queryKey: ["employments-for-saldo", targetEmpId],
    queryFn: async () => {
      if (!actor || !targetEmpId) return [];
      try {
        const res = await toAny(actor).listEmployments(BigInt(targetEmpId));
        const r = res;
        return r.__kind__ === "ok" ? r.ok ?? [] : [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId,
    staleTime: 6e4
  });
  const employmentStartDate = (() => {
    if (employments.length === 0) return null;
    const validEmployments = employments.filter((emp) => {
      if (!emp.von || emp.von <= 0n) return false;
      const ms = Number(emp.von) * 1e3;
      const year2 = new Date(ms).getFullYear();
      return year2 >= 2e3 && year2 <= 2100;
    });
    if (validEmployments.length === 0) return null;
    const earliest = validEmployments.reduce(
      (min, emp) => emp.von < min.von ? emp : min
    );
    const localDate = nanosToLocalIsoDate(earliest.von);
    if (!localDate) return null;
    const year = Number(localDate.slice(0, 4));
    if (year < 2e3 || year > 2100) return null;
    return localDate;
  })();
  const periodEnd = endOfWeekIso(/* @__PURE__ */ new Date());
  const { data: balance, isLoading } = useQuery({
    queryKey: ["workTimeBalance", targetEmpId, employmentStartDate, periodEnd],
    queryFn: async () => {
      if (!actor || !targetEmpId || !employmentStartDate) return null;
      try {
        const res = await toAny(actor).getEmployeeWorkTimeBalance(
          BigInt(targetEmpId),
          employmentStartDate,
          periodEnd
        );
        const r = res;
        return r.__kind__ === "ok" ? r.ok ?? null : null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!targetEmpId && !!employmentStartDate,
    staleTime: 3e4
  });
  const saldo = balance ? Number(balance.saldo) : null;
  const saldoIsPositive = saldo !== null && saldo > 0;
  const saldoIsNegative = saldo !== null && saldo < 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", "data-ocid": "arbeitszeitsaldo-widget", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-4 h-4 text-primary" }),
          "Arbeitszeitsaldo"
        ] }),
        employmentStartDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
          "Kumuliert ab",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground tabular-nums", children: isoToDe(employmentStartDate) }),
          " ",
          "bis",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground tabular-nums", children: isoToDe(periodEnd) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Kumuliert ab Anstellungsbeginn" })
      ] }),
      isAdminOrManager && employees.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: selectedEmpId,
          onValueChange: (v) => setSelectedEmpId(v),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectTrigger,
              {
                className: "w-48 h-8 text-xs",
                "data-ocid": "saldo-employee-select",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Mitarbeiter wählen" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: employees.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(emp.id), children: [
              emp.firstName,
              " ",
              emp.lastName
            ] }, String(emp.id))) })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16" }, i)) }) : employments.length === 0 || !employmentStartDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SaldoKpi,
          {
            label: "Soll-Stunden",
            value: "0:00",
            colorClass: "bg-muted/50",
            textColorClass: "text-foreground"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SaldoKpi,
          {
            label: "Ist-Stunden",
            value: "0:00",
            colorClass: "bg-primary/5",
            textColorClass: "text-primary"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SaldoKpi,
          {
            label: "Arbeitszeitsaldo",
            value: "0:00",
            colorClass: "bg-muted/50",
            textColorClass: "text-foreground"
          }
        )
      ] }) : balance == null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-8 h-8 text-muted-foreground/30 mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Saldo wird berechnet…" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SaldoKpi,
          {
            label: "Soll-Stunden",
            value: minutesToHhMm(Number(balance.sollStunden)),
            colorClass: "bg-muted/50",
            textColorClass: "text-foreground"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SaldoKpi,
          {
            label: "Ist-Stunden",
            value: minutesToHhMm(Number(balance.istStunden)),
            colorClass: "bg-primary/5",
            textColorClass: "text-primary"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SaldoKpi,
          {
            label: "Arbeitszeitsaldo",
            value: minutesToHhMm(Math.abs(saldo ?? 0)),
            colorClass: saldoIsNegative ? "bg-red-50 dark:bg-red-950/30" : saldoIsPositive ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-muted/50",
            textColorClass: saldoIsNegative ? "text-red-700 dark:text-red-400" : saldoIsPositive ? "text-emerald-700 dark:text-emerald-400" : "text-foreground",
            icon: saldoIsNegative ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-3 h-3" }) : saldoIsPositive ? /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3" }) : void 0
          }
        )
      ] }),
      balance && Number(balance.korrektionen) !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-3 pl-1", children: [
        "Korrektionen:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: minutesToHhMm(Number(balance.korrektionen)) })
      ] })
    ] })
  ] });
}
function SaldoKpi({
  label,
  value,
  colorClass,
  textColorClass,
  icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg p-3 ${colorClass}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium mb-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "p",
      {
        className: `text-lg font-bold font-display tabular-nums flex items-center gap-1 ${textColorClass}`,
        children: [
          icon,
          value
        ]
      }
    )
  ] });
}
function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, companyId, employeeName, role, employeeId } = useAuth();
  const { data: rawStats, isLoading } = useDashboardStats();
  const timezone = useCompanyTimezone();
  const { actor, isFetching } = useActor(createActor);
  const { data: myEmployments = [], isLoading: employmentsLoading } = useQuery({
    queryKey: ["my-employments-dashboard", String(employeeId)],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      try {
        const res = await toAny(actor).listEmployments(BigInt(employeeId));
        const r = res;
        if (r.__kind__ === "ok") {
          return (r.ok ?? []).filter((e) => {
            if (!e.von) return false;
            let vonBig;
            try {
              vonBig = typeof e.von === "bigint" ? e.von : BigInt(Math.round(Number(e.von)));
            } catch {
              return false;
            }
            if (vonBig <= 0n) return false;
            const year = new Date(Number(vonBig) * 1e3).getFullYear();
            return year >= 2e3 && year <= 2100;
          });
        }
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!employeeId,
    staleTime: 3e4
  });
  reactExports.useEffect(() => {
    if (!isAuthenticated || !companyId) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, companyId, navigate]);
  if (!isAuthenticated || !companyId) return null;
  const stats = rawStats;
  const isAdminOrManager = role === "admin" || role === "manager";
  const hoursWeek = (stats == null ? void 0 : stats.hoursThisWeek) ?? 0;
  const todayIso = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", {
    timeZone: timezone
  });
  const todayEmployment = getActiveEmploymentForDate(myEmployments, todayIso) ?? null;
  const hasEmployment = todayEmployment !== null;
  const hoursTargetMinutes = (() => {
    if (myEmployments.length === 0) return 0;
    const now = /* @__PURE__ */ new Date(`${todayIso}T12:00:00`);
    const dow = now.getDay();
    const daysFromMonday = dow === 0 ? 6 : dow - 1;
    let totalMinutes = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - daysFromMonday + i);
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      const dayIso = `${y}-${mo}-${da}`;
      const emp = getActiveEmploymentForDate(myEmployments, dayIso);
      if (emp) {
        totalMinutes += getEmploymentMinutesForDate(emp, dayIso);
      }
    }
    return totalMinutes;
  })();
  const hoursWeekMinutes = Math.round(hoursWeek * 60);
  const hoursWeekFormatted = minutesToHhMm(hoursWeekMinutes);
  const hoursTargetFormatted = minutesToHhMm(hoursTargetMinutes);
  const pendingVacation = Number((stats == null ? void 0 : stats.pendingVacations) ?? 0);
  const pendingExpenses = Number((stats == null ? void 0 : stats.pendingExpenses) ?? 0);
  const hoursTarget = hoursTargetMinutes / 60;
  const weeklyHoursData = [
    { tag: "Diese Woche", ist: hoursWeek, soll: hoursTarget }
  ];
  const expenseSummaryData = [{ label: "Ausstehend", anzahl: pendingExpenses }];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-screen-xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-0.5", children: [
          "Willkommen zurück,",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: employeeName ?? "Benutzer" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3.5 h-3.5" }),
        formatDateInTz(/* @__PURE__ */ new Date(), timezone, {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric"
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TimeOverviewDashboard,
      {
        employeeId: employeeId ? BigInt(employeeId) : null,
        companyId: companyId ? BigInt(companyId) : null,
        employments: myEmployments
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
        "data-ocid": "dashboard-kpi-row",
        children: isLoading ? ["k1", "k2"].map((id) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 rounded-xl" }, id)) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            KpiCard,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-primary" }),
              label: "Stunden diese Woche",
              value: `${hoursWeekFormatted} / ${hoursTargetFormatted}`,
              sub: employmentsLoading ? "Beschäftigung wird geladen…" : hasEmployment && hoursTarget > 0 ? `${Math.round(hoursWeek / (hoursTarget || 1) * 100)} % Ziel` : hoursWeek > 0 ? `${hoursWeekFormatted} erfasst` : "Noch keine Einträge diese Woche",
              colorClass: "bg-primary/10",
              "data-ocid": "kpi-hours"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            KpiCard,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-5 h-5 text-emerald-600" }),
              label: "Ausstehende Spesenrückerstattungen",
              value: String(pendingExpenses),
              sub: "Zur Verarbeitung",
              colorClass: "bg-emerald-500/10",
              "data-ocid": "kpi-expenses"
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ArbeitszeitsaldoWidget, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FeriensaldoWidget, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Stunden Übersicht — Aktuelle Woche" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-52" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 210, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        BarChart,
        {
          data: weeklyHoursData,
          margin: { top: 4, right: 8, bottom: 4, left: -20 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CartesianGrid,
              {
                strokeDasharray: "3 3",
                stroke: "oklch(0.92 0.02 255)",
                vertical: false
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              XAxis,
              {
                dataKey: "tag",
                tick: CHART_STYLE,
                axisLine: false,
                tickLine: false
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              YAxis,
              {
                tick: CHART_STYLE,
                axisLine: false,
                tickLine: false,
                domain: [
                  0,
                  Math.max(hoursTarget * 1.2, hoursWeek * 1.2, 50)
                ],
                tickFormatter: (v) => `${v}h`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip,
              {
                formatter: (v, name) => [
                  `${v}h`,
                  name === "ist" ? "Ist-Stunden" : "Soll-Stunden"
                ],
                contentStyle: TOOLTIP_STYLE
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Legend,
              {
                formatter: (value) => value === "ist" ? "Ist-Stunden" : "Soll-Stunden",
                wrapperStyle: { fontSize: 12 }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Bar,
              {
                dataKey: "ist",
                fill: "oklch(0.52 0.1 196)",
                radius: [3, 3, 0, 0],
                maxBarSize: 80
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Bar,
              {
                dataKey: "soll",
                fill: "oklch(0.65 0.12 40)",
                radius: [3, 3, 0, 0],
                maxBarSize: 80
              }
            )
          ]
        }
      ) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Spesen Status — Ausstehende Belege" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-52" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 210, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        BarChart,
        {
          data: expenseSummaryData,
          margin: { top: 4, right: 8, bottom: 4, left: -10 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CartesianGrid,
              {
                strokeDasharray: "3 3",
                stroke: "oklch(0.92 0.02 255)",
                vertical: false
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              XAxis,
              {
                dataKey: "label",
                tick: CHART_STYLE,
                axisLine: false,
                tickLine: false
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              YAxis,
              {
                tick: CHART_STYLE,
                axisLine: false,
                tickLine: false,
                allowDecimals: false,
                tickFormatter: (v) => String(v),
                width: 40
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip,
              {
                contentStyle: TOOLTIP_STYLE,
                formatter: (v) => [v, "Belege"]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Bar,
              {
                dataKey: "anzahl",
                fill: "oklch(0.52 0.1 196)",
                radius: [3, 3, 0, 0],
                maxBarSize: 80
              }
            )
          ]
        }
      ) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 border border-border rounded-xl p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground mb-3", children: "Schnellzugriff" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex flex-wrap gap-3",
          "data-ocid": "dashboard-quick-actions",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "default",
                onClick: () => navigate({ to: "/zeiten" }),
                "data-ocid": "btn-open-time",
                className: "transition-smooth",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 mr-2" }),
                  "Zeiterfassung öffnen"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => navigate({ to: "/spesen" }),
                "data-ocid": "btn-open-expenses",
                className: "transition-smooth",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-4 h-4 mr-2" }),
                  "Spesen erfassen"
                ]
              }
            ),
            isAdminOrManager && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: () => navigate({ to: "/genehmigungen" }),
                "data-ocid": "btn-open-approvals",
                className: "transition-smooth border-amber-300 text-amber-700 hover:bg-amber-50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "w-4 h-4 mr-2" }),
                  "Genehmigungen",
                  pendingVacation > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-primary-foreground text-[10px] font-bold", children: pendingVacation })
                ]
              }
            )
          ]
        }
      )
    ] })
  ] }) });
}
function KpiCard({
  icon,
  label,
  value,
  sub,
  colorClass,
  "data-ocid": ocid
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", "data-ocid": ocid, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-5 pb-5 px-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wide truncate", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-display font-bold text-foreground mt-1.5 truncate", children: value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: sub })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2.5 rounded-lg flex-shrink-0 ${colorClass}`, children: icon })
  ] }) }) });
}
export {
  DashboardPage as default
};
