import { r as reactExports, j as jsxRuntimeExports, R as React, c as cn, u as useInternetIdentity, a as useNavigate } from "./index-D_yjRFGt.js";
import { u as useControllableState, P as Primitive, a as useId, c as composeEventHandlers, b as Presence, d as createContextScope, e as useLayoutEffect2, f as createCollection, g as useDirection, C as ChevronDown, h as ChevronRight, G as Globe, i as Check, X, j as ChevronLeft, k as Clock, R as Receipt, l as Calendar, U as Users, F as FileText } from "./x-BHvIGru9.js";
import { u as useComposedRefs } from "./index-HGa3Ynxo.js";
import { C as Card, a as CardContent } from "./card-Cqx-QXhC.js";
import { u as useActor, a as useAuthStore, b as useQuery, c as createActor } from "./useAuthStore-RPelH0kd.js";
import { S as Shield } from "./shield-DBKz9E1a.js";
import { C as CircleCheckBig } from "./circle-check-big-M4F681dK.js";
import { E as Eye } from "./eye-hJvqafDa.js";
import { c as createLucideIcon } from "./createLucideIcon-C599ATMm.js";
var COLLAPSIBLE_NAME = "Collapsible";
var [createCollapsibleContext, createCollapsibleScope] = createContextScope(COLLAPSIBLE_NAME);
var [CollapsibleProvider, useCollapsibleContext] = createCollapsibleContext(COLLAPSIBLE_NAME);
var Collapsible = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCollapsible,
      open: openProp,
      defaultOpen,
      disabled,
      onOpenChange,
      ...collapsibleProps
    } = props;
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: COLLAPSIBLE_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CollapsibleProvider,
      {
        scope: __scopeCollapsible,
        disabled,
        contentId: useId(),
        open,
        onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            "data-state": getState$1(open),
            "data-disabled": disabled ? "" : void 0,
            ...collapsibleProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Collapsible.displayName = COLLAPSIBLE_NAME;
var TRIGGER_NAME$1 = "CollapsibleTrigger";
var CollapsibleTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCollapsible, ...triggerProps } = props;
    const context = useCollapsibleContext(TRIGGER_NAME$1, __scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-controls": context.contentId,
        "aria-expanded": context.open || false,
        "data-state": getState$1(context.open),
        "data-disabled": context.disabled ? "" : void 0,
        disabled: context.disabled,
        ...triggerProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
CollapsibleTrigger.displayName = TRIGGER_NAME$1;
var CONTENT_NAME$1 = "CollapsibleContent";
var CollapsibleContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...contentProps } = props;
    const context = useCollapsibleContext(CONTENT_NAME$1, props.__scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContentImpl, { ...contentProps, ref: forwardedRef, present }) });
  }
);
CollapsibleContent.displayName = CONTENT_NAME$1;
var CollapsibleContentImpl = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeCollapsible, present, children, ...contentProps } = props;
  const context = useCollapsibleContext(CONTENT_NAME$1, __scopeCollapsible);
  const [isPresent, setIsPresent] = reactExports.useState(present);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const heightRef = reactExports.useRef(0);
  const height = heightRef.current;
  const widthRef = reactExports.useRef(0);
  const width = widthRef.current;
  const isOpen = context.open || isPresent;
  const isMountAnimationPreventedRef = reactExports.useRef(isOpen);
  const originalStylesRef = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
    return () => cancelAnimationFrame(rAF);
  }, []);
  useLayoutEffect2(() => {
    const node = ref.current;
    if (node) {
      originalStylesRef.current = originalStylesRef.current || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName
      };
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";
      const rect = node.getBoundingClientRect();
      heightRef.current = rect.height;
      widthRef.current = rect.width;
      if (!isMountAnimationPreventedRef.current) {
        node.style.transitionDuration = originalStylesRef.current.transitionDuration;
        node.style.animationName = originalStylesRef.current.animationName;
      }
      setIsPresent(present);
    }
  }, [context.open, present]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-state": getState$1(context.open),
      "data-disabled": context.disabled ? "" : void 0,
      id: context.contentId,
      hidden: !isOpen,
      ...contentProps,
      ref: composedRefs,
      style: {
        [`--radix-collapsible-content-height`]: height ? `${height}px` : void 0,
        [`--radix-collapsible-content-width`]: width ? `${width}px` : void 0,
        ...props.style
      },
      children: isOpen && children
    }
  );
});
function getState$1(open) {
  return open ? "open" : "closed";
}
var Root = Collapsible;
var Trigger = CollapsibleTrigger;
var Content = CollapsibleContent;
var ACCORDION_NAME = "Accordion";
var ACCORDION_KEYS = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
var [Collection, useCollection, createCollectionScope] = createCollection(ACCORDION_NAME);
var [createAccordionContext] = createContextScope(ACCORDION_NAME, [
  createCollectionScope,
  createCollapsibleScope
]);
var useCollapsibleScope = createCollapsibleScope();
var Accordion$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { type, ...accordionProps } = props;
    const singleProps = accordionProps;
    const multipleProps = accordionProps;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeAccordion, children: type === "multiple" ? /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImplMultiple, { ...multipleProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImplSingle, { ...singleProps, ref: forwardedRef }) });
  }
);
Accordion$1.displayName = ACCORDION_NAME;
var [AccordionValueProvider, useAccordionValueContext] = createAccordionContext(ACCORDION_NAME);
var [AccordionCollapsibleProvider, useAccordionCollapsibleContext] = createAccordionContext(
  ACCORDION_NAME,
  { collapsible: false }
);
var AccordionImplSingle = React.forwardRef(
  (props, forwardedRef) => {
    const {
      value: valueProp,
      defaultValue,
      onValueChange = () => {
      },
      collapsible = false,
      ...accordionSingleProps
    } = props;
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? "",
      onChange: onValueChange,
      caller: ACCORDION_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionValueProvider,
      {
        scope: props.__scopeAccordion,
        value: React.useMemo(() => value ? [value] : [], [value]),
        onItemOpen: setValue,
        onItemClose: React.useCallback(() => collapsible && setValue(""), [collapsible, setValue]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImpl, { ...accordionSingleProps, ref: forwardedRef }) })
      }
    );
  }
);
var AccordionImplMultiple = React.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...accordionMultipleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? [],
    onChange: onValueChange,
    caller: ACCORDION_NAME
  });
  const handleItemOpen = React.useCallback(
    (itemValue) => setValue((prevValue = []) => [...prevValue, itemValue]),
    [setValue]
  );
  const handleItemClose = React.useCallback(
    (itemValue) => setValue((prevValue = []) => prevValue.filter((value2) => value2 !== itemValue)),
    [setValue]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AccordionValueProvider,
    {
      scope: props.__scopeAccordion,
      value,
      onItemOpen: handleItemOpen,
      onItemClose: handleItemClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImpl, { ...accordionMultipleProps, ref: forwardedRef }) })
    }
  );
});
var [AccordionImplProvider, useAccordionContext] = createAccordionContext(ACCORDION_NAME);
var AccordionImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, disabled, dir, orientation = "vertical", ...accordionProps } = props;
    const accordionRef = React.useRef(null);
    const composedRefs = useComposedRefs(accordionRef, forwardedRef);
    const getItems = useCollection(__scopeAccordion);
    const direction = useDirection(dir);
    const isDirectionLTR = direction === "ltr";
    const handleKeyDown = composeEventHandlers(props.onKeyDown, (event) => {
      var _a;
      if (!ACCORDION_KEYS.includes(event.key)) return;
      const target = event.target;
      const triggerCollection = getItems().filter((item) => {
        var _a2;
        return !((_a2 = item.ref.current) == null ? void 0 : _a2.disabled);
      });
      const triggerIndex = triggerCollection.findIndex((item) => item.ref.current === target);
      const triggerCount = triggerCollection.length;
      if (triggerIndex === -1) return;
      event.preventDefault();
      let nextIndex = triggerIndex;
      const homeIndex = 0;
      const endIndex = triggerCount - 1;
      const moveNext = () => {
        nextIndex = triggerIndex + 1;
        if (nextIndex > endIndex) {
          nextIndex = homeIndex;
        }
      };
      const movePrev = () => {
        nextIndex = triggerIndex - 1;
        if (nextIndex < homeIndex) {
          nextIndex = endIndex;
        }
      };
      switch (event.key) {
        case "Home":
          nextIndex = homeIndex;
          break;
        case "End":
          nextIndex = endIndex;
          break;
        case "ArrowRight":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              moveNext();
            } else {
              movePrev();
            }
          }
          break;
        case "ArrowDown":
          if (orientation === "vertical") {
            moveNext();
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              movePrev();
            } else {
              moveNext();
            }
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical") {
            movePrev();
          }
          break;
      }
      const clampedIndex = nextIndex % triggerCount;
      (_a = triggerCollection[clampedIndex].ref.current) == null ? void 0 : _a.focus();
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionImplProvider,
      {
        scope: __scopeAccordion,
        disabled,
        direction: dir,
        orientation,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: __scopeAccordion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            ...accordionProps,
            "data-orientation": orientation,
            ref: composedRefs,
            onKeyDown: disabled ? void 0 : handleKeyDown
          }
        ) })
      }
    );
  }
);
var ITEM_NAME = "AccordionItem";
var [AccordionItemProvider, useAccordionItemContext] = createAccordionContext(ITEM_NAME);
var AccordionItem$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, value, ...accordionItemProps } = props;
    const accordionContext = useAccordionContext(ITEM_NAME, __scopeAccordion);
    const valueContext = useAccordionValueContext(ITEM_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    const triggerId = useId();
    const open = value && valueContext.value.includes(value) || false;
    const disabled = accordionContext.disabled || props.disabled;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionItemProvider,
      {
        scope: __scopeAccordion,
        open,
        disabled,
        triggerId,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Root,
          {
            "data-orientation": accordionContext.orientation,
            "data-state": getState(open),
            ...collapsibleScope,
            ...accordionItemProps,
            ref: forwardedRef,
            disabled,
            open,
            onOpenChange: (open2) => {
              if (open2) {
                valueContext.onItemOpen(value);
              } else {
                valueContext.onItemClose(value);
              }
            }
          }
        )
      }
    );
  }
);
AccordionItem$1.displayName = ITEM_NAME;
var HEADER_NAME = "AccordionHeader";
var AccordionHeader = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...headerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(HEADER_NAME, __scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.h3,
      {
        "data-orientation": accordionContext.orientation,
        "data-state": getState(itemContext.open),
        "data-disabled": itemContext.disabled ? "" : void 0,
        ...headerProps,
        ref: forwardedRef
      }
    );
  }
);
AccordionHeader.displayName = HEADER_NAME;
var TRIGGER_NAME = "AccordionTrigger";
var AccordionTrigger$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...triggerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleContext = useAccordionCollapsibleContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.ItemSlot, { scope: __scopeAccordion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trigger,
      {
        "aria-disabled": itemContext.open && !collapsibleContext.collapsible || void 0,
        "data-orientation": accordionContext.orientation,
        id: itemContext.triggerId,
        ...collapsibleScope,
        ...triggerProps,
        ref: forwardedRef
      }
    ) });
  }
);
AccordionTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "AccordionContent";
var AccordionContent$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...contentProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(CONTENT_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Content,
      {
        role: "region",
        "aria-labelledby": itemContext.triggerId,
        "data-orientation": accordionContext.orientation,
        ...collapsibleScope,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ["--radix-accordion-content-height"]: "var(--radix-collapsible-content-height)",
          ["--radix-accordion-content-width"]: "var(--radix-collapsible-content-width)",
          ...props.style
        }
      }
    );
  }
);
AccordionContent$1.displayName = CONTENT_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var Root2 = Accordion$1;
var Item = AccordionItem$1;
var Header = AccordionHeader;
var Trigger2 = AccordionTrigger$1;
var Content2 = AccordionContent$1;
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode);
function Accordion({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { "data-slot": "accordion", ...props });
}
function AccordionItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Item,
    {
      "data-slot": "accordion-item",
      className: cn("border-b last:border-b-0", className),
      ...props
    }
  );
}
function AccordionTrigger({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Trigger2,
    {
      "data-slot": "accordion-trigger",
      className: cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" })
      ]
    }
  ) });
}
function AccordionContent({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content2,
    {
      "data-slot": "accordion-content",
      className: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm",
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pt-0 pb-4", className), children })
    }
  );
}
const toAny = (a) => a;
const NAV_LINKS = [
  { label: "Funktionen", href: "#funktionen" },
  { label: "Preise", href: "#preise" },
  { label: "FAQ", href: "#faq" }
];
const TRUST_LABELS = [
  { icon: Shield, label: "Sicher" },
  { icon: Globe, label: "Dezentral" },
  { icon: CircleCheckBig, label: "Effektiv" }
];
const FEATURES = [
  {
    icon: Clock,
    title: "Zeiterfassung",
    desc: "Erfasse Arbeitszeiten präzise nach Projekt und Leistungsart – auch unterwegs."
  },
  {
    icon: Receipt,
    title: "Spesenverwaltung",
    desc: "Spesen mit Belegfotos erfassen, einreichen und genehmigen – papierlos."
  },
  {
    icon: Calendar,
    title: "Kalenderübersicht",
    desc: "Vollständiger Monatsüberblick über Zeiten, Ferien und Abwesenheiten."
  },
  {
    icon: CircleCheckBig,
    title: "Genehmigungen",
    desc: "Ferien- und Spesenanträge digital einreichen und freigeben."
  },
  {
    icon: ChartColumn,
    title: "Auswertungen",
    desc: "Übersichtliche Berichte zu Stunden, Kosten und Mitarbeiterauslastung."
  },
  {
    icon: Users,
    title: "Mitarbeiterverwaltung",
    desc: "Stammdaten, Beschäftigungen und Ferienguthaben zentral verwalten."
  },
  {
    icon: FileText,
    title: "Fakturierung",
    desc: "Verrechenbare Stunden und Spesen auf einen Blick für eine schnelle Rechnungsstellung."
  }
];
const BENEFITS = [
  {
    icon: Globe,
    title: "Dezentralisiert",
    desc: "Daten leben auf dem Internet Computer – keine zentrale Server-Infrastruktur, keine Single Points of Failure.",
    accentColor: "#006066",
    accentLight: "rgba(0,96,102,0.10)",
    waveColor: "rgba(0,96,102,0.07)"
  },
  {
    icon: Shield,
    title: "Datensicherheit",
    desc: "Keine Drittserver, keine Abhängigkeiten von Cloud-Anbietern. Deine Daten gehören dir.",
    accentColor: "#0A4A75",
    accentLight: "rgba(10,74,117,0.10)",
    waveColor: "rgba(10,74,117,0.07)"
  },
  {
    icon: Eye,
    title: "Transparenz",
    desc: "Unveränderliche Blockchain-Protokollierung schafft vollständige Nachvollziehbarkeit.",
    accentColor: "#006066",
    accentLight: "rgba(0,96,102,0.10)",
    waveColor: "rgba(0,96,102,0.07)"
  }
];
const FAQS = [
  {
    id: "faq-was-ist",
    q: "Was ist iReport Onchain?",
    a: "iReport ist eine webbasierte HR- und Zeiterfassungsplattform für Schweizer Unternehmen. Sie läuft vollständig auf dem Internet Computer – dezentral, sicher und ohne zentrale Server."
  },
  {
    id: "faq-anmeldung",
    q: "Wie funktioniert die Anmeldung?",
    a: "Die Authentifizierung erfolgt ausschliesslich über Internet Identity – ein dezentrales Identitätssystem ohne Passwörter. Du brauchst kein separates Konto zu erstellen."
  },
  {
    id: "faq-sicherheit",
    q: "Wie sicher sind meine Daten?",
    a: "Deine Daten werden ausschliesslich im Internet Computer Canister deines Unternehmens gespeichert. Es gibt keine zentrale Datenbank, keine Drittanbieter und keine Abhängigkeiten von Cloud-Diensten."
  },
  {
    id: "faq-kosten",
    q: "Was kostet iReport?",
    a: "Die Basisversion ist kostenlos und für Teams bis 2 Mitarbeitende geeignet. Die Professional-Version kostet CHF 6.00 pro Mitarbeiter / Monat im Jahres-Abonnement oder CHF 7.00 pro Mitarbeiter / Monat im Monats-Abonnement."
  },
  {
    id: "faq-start",
    q: "Wie starte ich mit iReport?",
    a: "Klicke auf 'Anmelden mit Internet Identity', registriere dein Unternehmen und füge Mitarbeitende via Einladungslink hinzu. Der Einstieg dauert weniger als 5 Minuten."
  },
  {
    id: "faq-mobile",
    q: "Funktioniert iReport auf dem Smartphone?",
    a: "Ja – iReport ist vollständig responsiv. Du kannst Zeiten und Spesen bequem vom Smartphone oder Tablet aus erfassen, ohne eine App installieren zu müssen."
  }
];
function scrollToId(id) {
  var _a;
  (_a = document.getElementById(id)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
}
function LandingNav({
  onLogin,
  isLoggingIn
}) {
  const [mobileOpen, setMobileOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "nav",
    {
      className: "fixed z-50",
      style: {
        top: "16px",
        left: "12px",
        right: "12px",
        borderRadius: "12px",
        height: "56px",
        backgroundColor: "#00182b",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.22), 0 1px 6px rgba(0,0,0,0.12)",
        overflow: "visible"
      },
      "data-ocid": "landing.nav",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between px-5",
            style: { height: "56px" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: "/",
                  className: "flex items-center shrink-0",
                  "aria-label": "iReport Startseite",
                  style: { height: "56px", overflow: "visible" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: "/assets/logo_transparent.png",
                      alt: "iReport",
                      className: "w-auto",
                      style: { height: "108px", display: "block" }
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:flex items-center gap-7", children: NAV_LINKS.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                NavLinkBtn,
                {
                  label: link.label,
                  targetId: link.href.slice(1)
                },
                link.label
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: onLogin,
                    disabled: isLoggingIn,
                    className: "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-60",
                    style: {
                      backgroundColor: "#5090C1",
                      color: "#ffffff",
                      fontFamily: "'Play', sans-serif"
                    },
                    onMouseEnter: (e) => {
                      if (!isLoggingIn)
                        e.currentTarget.style.backgroundColor = "#1F6495";
                    },
                    onMouseLeave: (e) => {
                      if (!isLoggingIn)
                        e.currentTarget.style.backgroundColor = "#5090C1";
                    },
                    "data-ocid": "landing.nav.login_button",
                    children: [
                      isLoggingIn ? "Anmeldung läuft…" : "Anmelden",
                      !isLoggingIn && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: "md:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-lg transition-colors duration-150",
                    "aria-label": "Menü öffnen",
                    onClick: () => setMobileOpen((v) => !v),
                    style: {
                      backgroundColor: mobileOpen ? "rgba(255,255,255,0.10)" : "transparent"
                    },
                    "data-ocid": "landing.nav.mobile_menu_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "block w-5 h-0.5 rounded-full transition-all duration-200",
                          style: {
                            backgroundColor: "rgba(255,255,255,0.85)",
                            transform: mobileOpen ? "translateY(4px) rotate(45deg)" : "none"
                          }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "block w-5 h-0.5 rounded-full transition-all duration-200",
                          style: {
                            backgroundColor: "rgba(255,255,255,0.85)",
                            opacity: mobileOpen ? 0 : 1
                          }
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "block w-5 h-0.5 rounded-full transition-all duration-200",
                          style: {
                            backgroundColor: "rgba(255,255,255,0.85)",
                            transform: mobileOpen ? "translateY(-4px) rotate(-45deg)" : "none"
                          }
                        }
                      )
                    ]
                  }
                )
              ] })
            ]
          }
        ),
        mobileOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "md:hidden flex flex-col gap-1 px-5 pb-4 pt-1",
            style: {
              borderTop: "1px solid rgba(255,255,255,0.07)",
              backgroundColor: "rgba(0, 24, 43, 0.95)",
              borderRadius: "0 0 12px 12px"
            },
            children: NAV_LINKS.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setMobileOpen(false);
                  scrollToId(link.href.slice(1));
                },
                className: "text-left text-sm font-medium py-2.5 px-3 rounded-lg transition-colors duration-150",
                style: {
                  color: "rgba(255,255,255,0.82)",
                  fontFamily: "'Play', sans-serif",
                  background: "none",
                  border: "none"
                },
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                },
                "data-ocid": `landing.nav.mobile.${link.label.toLowerCase()}`,
                children: link.label
              },
              link.label
            ))
          }
        )
      ]
    }
  ) });
}
function NavLinkBtn({ label, targetId }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: () => scrollToId(targetId),
      className: "text-sm font-medium transition-colors duration-200",
      style: {
        color: "rgba(255,255,255,0.82)",
        fontFamily: "'Play', sans-serif",
        fontSize: "0.9rem",
        background: "none",
        border: "none"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.color = "#ffffff";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.82)";
      },
      "data-ocid": `landing.nav.${label.toLowerCase()}`,
      children: label
    }
  );
}
function HeroSection({
  onLogin,
  isLoggingIn
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: "w-full pt-16 pb-10 md:pt-18 md:pb-14",
      style: { backgroundColor: "#0A4A75" },
      "data-ocid": "landing.hero.section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-7", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit",
                style: {
                  backgroundColor: "rgba(80,144,193,0.25)",
                  color: "#5090C1",
                  fontFamily: "'Play', sans-serif"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#5090C1] animate-pulse" }),
                  "Swiss HR Software on the Internet Computer"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h1",
              {
                className: "text-4xl md:text-5xl font-bold leading-tight",
                style: { color: "#ffffff", fontFamily: "'Play', sans-serif" },
                children: "Zeiterfassung & HR für Schweizer Unternehmen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-lg leading-relaxed",
                style: { color: "rgba(255,255,255,0.75)" },
                children: "Verwalte Arbeitszeiten, Spesen, Ferien und Mitarbeiterdaten – dezentral, sicher und direkt auf der Blockchain."
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: onLogin,
                  disabled: isLoggingIn,
                  className: "flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-bold text-base transition-all duration-200 disabled:opacity-60",
                  style: {
                    backgroundColor: "#5090C1",
                    color: "#ffffff",
                    fontFamily: "'Play', sans-serif"
                  },
                  onMouseEnter: (e) => {
                    if (!isLoggingIn)
                      e.currentTarget.style.backgroundColor = "#1F6495";
                  },
                  onMouseLeave: (e) => {
                    if (!isLoggingIn)
                      e.currentTarget.style.backgroundColor = "#5090C1";
                  },
                  "data-ocid": "landing.hero.login_button",
                  children: [
                    isLoggingIn ? "Anmeldung läuft…" : "Anmelden mit Internet Identity",
                    !isLoggingIn && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => scrollToId("funktionen"),
                  className: "flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-base transition-all duration-200 border",
                  style: {
                    color: "rgba(255,255,255,0.85)",
                    borderColor: "rgba(255,255,255,0.3)",
                    backgroundColor: "transparent"
                  },
                  onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  },
                  "data-ocid": "landing.hero.features_button",
                  children: "Funktionen entdecken"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex justify-center md:justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-full max-w-[520px] rounded-2xl overflow-hidden flex items-center justify-center",
                style: {
                  backgroundColor: "#0A4A75",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)",
                  minHeight: 320
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: "/assets/image-019d8d05-c956-7542-9dcf-ada97404d7da.png",
                    alt: "iReport HR Dashboard",
                    style: {
                      display: "block",
                      objectFit: "contain",
                      objectPosition: "center",
                      width: "100%",
                      height: "auto",
                      maxHeight: 420,
                      mixBlendMode: "screen",
                      backgroundColor: "transparent"
                    }
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute -bottom-4 left-0 px-4 py-2.5 rounded-xl text-sm font-semibold",
                style: {
                  backgroundColor: "#ffffff",
                  color: "#0A4A75",
                  fontFamily: "'Play', sans-serif",
                  boxShadow: "0 4px 14px rgba(10,74,117,0.18)"
                },
                children: "✓ Keine Installation nötig"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[1280px] mx-auto px-6 mt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-4 justify-center md:justify-start", children: TRUST_LABELS.map(({ icon: Icon, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold",
            style: {
              backgroundColor: "rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(255,255,255,0.18)",
              fontFamily: "'Play', sans-serif"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 15, style: { color: "#5090C1" } }),
              label
            ]
          },
          label
        )) }) })
      ]
    }
  );
}
function FeatureCarousel() {
  const scrollRef = reactExports.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = reactExports.useState(false);
  const [canScrollRight, setCanScrollRight] = reactExports.useState(true);
  const checkScroll = reactExports.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);
  reactExports.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);
  const scroll = (dir) => {
    var _a;
    (_a = scrollRef.current) == null ? void 0 : _a.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-8", "data-ocid": "landing.features.carousel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "aria-label": "Scroll links",
        onClick: () => scroll("left"),
        className: "absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-150",
        style: {
          backgroundColor: canScrollLeft ? "#0A4A75" : "rgba(10,74,117,0.15)",
          color: canScrollLeft ? "#ffffff" : "rgba(10,74,117,0.30)",
          border: "none",
          pointerEvents: canScrollLeft ? "auto" : "none",
          opacity: canScrollLeft ? 1 : 0.4
        },
        tabIndex: canScrollLeft ? 0 : -1,
        "data-ocid": "landing.features.scroll_left",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 18 })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: scrollRef,
        className: "flex gap-5 overflow-x-auto pb-3",
        style: {
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        },
        children: FEATURES.map(({ icon: Icon, title, desc }, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            className: "border hover:shadow-lg transition-all duration-200 rounded-xl shrink-0",
            style: {
              borderColor: "rgba(10,74,117,0.10)",
              scrollSnapAlign: "start",
              width: "clamp(220px, 24vw, 260px)"
            },
            "data-ocid": `landing.features.item.${i + 1}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6 flex flex-col gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                  style: { backgroundColor: "rgba(10,74,117,0.08)" },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 22, style: { color: "#1F6495" } })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h3",
                {
                  className: "text-base font-bold",
                  style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
                  children: title
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-sm leading-relaxed",
                  style: { color: "#64748b" },
                  children: desc
                }
              )
            ] })
          },
          title
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "aria-label": "Scroll rechts",
        onClick: () => scroll("right"),
        className: "absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-150",
        style: {
          backgroundColor: canScrollRight ? "#0A4A75" : "rgba(10,74,117,0.15)",
          color: canScrollRight ? "#ffffff" : "rgba(10,74,117,0.30)",
          border: "none",
          pointerEvents: canScrollRight ? "auto" : "none",
          opacity: canScrollRight ? 1 : 0.4
        },
        tabIndex: canScrollRight ? 0 : -1,
        "data-ocid": "landing.features.scroll_right",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18 })
      }
    )
  ] });
}
function FeatureGrid() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      id: "funktionen",
      className: "w-full py-20 bg-white",
      "data-ocid": "landing.features.section",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1280px] mx-auto px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-14", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              className: "text-3xl md:text-4xl font-bold mb-4",
              style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
              children: "Alles, was du brauchst"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg max-w-xl mx-auto", style: { color: "#555e6e" }, children: "iReport deckt alle Bereiche der HR- und Zeiterfassung in einem einzigen System ab." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCarousel, {})
      ] })
    }
  );
}
function TeamSection() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      className: "w-full py-20",
      style: { backgroundColor: "#f4f7fb" },
      "data-ocid": "landing.team.section",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              className: "text-3xl md:text-4xl font-bold",
              style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
              children: "Für moderne Teams"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg leading-relaxed", style: { color: "#4a5568" }, children: "iReport unterstützt dein gesamtes Team – vom Mitarbeitenden bis zur Unternehmensleitung. Klare Rollenverteilung sorgt dafür, dass jeder nur das sieht, was er braucht." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-3", children: [
            "Rollenbasierter Zugriff: Admin, Manager, Mitarbeiter",
            "Ferien- und Spesenanträge mit digitalem Genehmigungsworkflow",
            "Auswertungen und Berichte für Führungskräfte"
          ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "flex items-center gap-3 text-sm",
              style: { color: "#4a5568" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, style: { color: "#1F6495", flexShrink: 0 } }),
                item
              ]
            },
            item
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "rounded-2xl overflow-hidden shadow-lg flex items-center justify-center",
            style: { backgroundColor: "#f4f7fb", minHeight: 280 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: "/assets/image-019d8d05-c932-772f-bcd1-e76c16896a5d.png",
                alt: "Team im Büro arbeitet mit iReport",
                style: {
                  display: "block",
                  objectFit: "contain",
                  objectPosition: "center",
                  width: "100%",
                  height: "auto",
                  maxHeight: 400,
                  mixBlendMode: "multiply",
                  backgroundColor: "transparent"
                }
              }
            )
          }
        )
      ] })
    }
  );
}
function AvailabilitySection() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      className: "w-full py-20 bg-white",
      "data-ocid": "landing.availability.section",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex items-center justify-center order-2 md:order-1 rounded-2xl overflow-hidden",
            style: { backgroundColor: "#ffffff", minHeight: 280 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: "/assets/woman-tablet-available.png",
                alt: "iReport auf Tablet – überall verfügbar",
                style: {
                  display: "block",
                  objectFit: "contain",
                  objectPosition: "center",
                  width: "100%",
                  height: "auto",
                  maxHeight: 420,
                  mixBlendMode: "multiply",
                  backgroundColor: "transparent"
                }
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6 order-1 md:order-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              className: "text-3xl md:text-4xl font-bold",
              style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
              children: "Überall verfügbar"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg leading-relaxed", style: { color: "#4a5568" }, children: "iReport läuft direkt im Browser – auf dem Desktop, Tablet oder Smartphone. Keine App-Installation, keine Updates, keine Wartezeiten." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-3", children: [
            "Responsive Design für alle Bildschirmgrössen",
            "Funktioniert auf iOS, Android und Desktop",
            "Immer aktuell – kein manuelles Update nötig"
          ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "flex items-center gap-3 text-sm",
              style: { color: "#4a5568" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, style: { color: "#1F6495", flexShrink: 0 } }),
                item
              ]
            },
            item
          )) })
        ] })
      ] })
    }
  );
}
function NoInstallSection() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      className: "w-full py-20",
      style: { backgroundColor: "#f4f7fb" },
      "data-ocid": "landing.noinstall.section",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              className: "text-3xl md:text-4xl font-bold",
              style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
              children: "Keine Installation nötig"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg leading-relaxed", style: { color: "#4a5568" }, children: "iReport läuft vollständig im Browser. Kein App Store, kein Update, kein Wartungsfenster – starte sofort direkt über deinen Browser." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-3", children: [
            "Direkt im Browser öffnen – kein Download",
            "Automatisch immer auf dem neuesten Stand",
            "Funktioniert auf jedem Gerät"
          ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "flex items-center gap-3 text-sm",
              style: { color: "#4a5568" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 16, style: { color: "#1F6495", flexShrink: 0 } }),
                item
              ]
            },
            item
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "rounded-2xl flex items-center justify-center",
            style: { backgroundColor: "#f4f7fb", minHeight: 280 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: "/assets/image-019d8c2d-fdc1-741d-bb7a-04ed04e2c751.png",
                alt: "iReport – Keine Installation nötig",
                style: {
                  display: "block",
                  objectFit: "contain",
                  objectPosition: "center",
                  width: "100%",
                  height: "auto",
                  maxHeight: 380
                }
              }
            )
          }
        )
      ] })
    }
  );
}
function BenefitsSection() {
  const [lightboxOpen, setLightboxOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: "w-full py-20 bg-white",
      "data-ocid": "landing.benefits.section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1280px] mx-auto px-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-14", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h2",
              {
                className: "text-3xl md:text-4xl font-bold mb-4",
                style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
                children: "Warum iReport?"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg max-w-xl mx-auto", style: { color: "#555e6e" }, children: "Gebaut für die Anforderungen moderner Schweizer Unternehmen – mit den Vorteilen der Blockchain-Technologie." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-6", children: [
            BENEFITS.map(
              ({ icon: Icon, title, desc, accentColor, accentLight, waveColor }, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "relative flex flex-col overflow-hidden rounded-2xl shadow-lg",
                  style: {
                    backgroundColor: "#fafcff",
                    border: "1px solid rgba(10,74,117,0.08)"
                  },
                  "data-ocid": `landing.benefits.item.${i + 1}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "svg",
                      {
                        className: "absolute top-0 left-0 w-full",
                        height: "54",
                        viewBox: "0 0 300 54",
                        preserveAspectRatio: "none",
                        "aria-hidden": "true",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "path",
                          {
                            d: "M0,0 L300,0 L300,30 Q225,54 150,38 Q75,22 0,46 Z",
                            fill: waveColor
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col gap-4 p-7 pt-10", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "w-12 h-12 rounded-full flex items-center justify-center shadow-sm",
                          style: { backgroundColor: accentLight },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 22, style: { color: accentColor } })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h3",
                        {
                          className: "text-base font-bold",
                          style: {
                            color: "#0A4A75",
                            fontFamily: "'Play', sans-serif"
                          },
                          children: title
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          className: "text-sm leading-relaxed",
                          style: { color: "#64748b" },
                          children: desc
                        }
                      )
                    ] })
                  ]
                },
                title
              )
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: "relative flex flex-col overflow-hidden rounded-2xl shadow-lg cursor-pointer group text-left w-full",
                style: {
                  backgroundColor: "#fafcff",
                  border: "1px solid rgba(10,74,117,0.08)"
                },
                onClick: () => setLightboxOpen(true),
                "data-ocid": "landing.benefits.item.4",
                "aria-label": "Technologie-Onepager anzeigen",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "svg",
                    {
                      className: "absolute top-0 left-0 w-full",
                      height: "54",
                      viewBox: "0 0 300 54",
                      preserveAspectRatio: "none",
                      "aria-hidden": "true",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          d: "M0,0 L300,0 L300,30 Q225,54 150,38 Q75,22 0,46 Z",
                          fill: "rgba(0,96,102,0.07)"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col gap-3 p-7 pt-10", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "w-full rounded-lg overflow-hidden shadow-sm ring-1 ring-black/5 group-hover:shadow-md transition-shadow duration-200",
                        style: { aspectRatio: "4/3", backgroundColor: "#e8f0f0" },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "img",
                          {
                            src: "/assets/onepager_hreport_2.png",
                            alt: "Technologie-Onepager Vorschau",
                            className: "w-full h-full object-cover",
                            onError: (e) => {
                              const el = e.currentTarget;
                              el.style.display = "none";
                              const parent = el.parentElement;
                              if (parent && !parent.querySelector(".onepager-fallback")) {
                                const fb = document.createElement("div");
                                fb.className = "onepager-fallback w-full h-full flex items-center justify-center text-sm font-semibold";
                                fb.style.color = "#006066";
                                fb.textContent = "Onepager";
                                parent.appendChild(fb);
                              }
                            }
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "h3",
                      {
                        className: "text-base font-bold",
                        style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
                        children: "Technologie"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: "text-sm leading-relaxed",
                        style: { color: "#64748b" },
                        children: "Erfahre mehr über die Technologie hinter iReport."
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "text-xs font-semibold mt-1",
                        style: { color: "#006066" },
                        children: "Onepager anzeigen →"
                      }
                    )
                  ] })
                ]
              }
            )
          ] })
        ] }),
        lightboxOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "fixed inset-0 z-50 flex items-center justify-center p-4",
            style: { backgroundColor: "rgba(0,0,0,0.85)" },
            onClick: () => setLightboxOpen(false),
            onKeyDown: (e) => {
              if (e.key === "Escape") setLightboxOpen(false);
            },
            "data-ocid": "landing.benefits.onepager.dialog",
            "aria-modal": "true",
            "aria-label": "Technologie-Onepager",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center",
                  style: { backgroundColor: "rgba(255,255,255,0.15)" },
                  onClick: (e) => {
                    e.stopPropagation();
                    setLightboxOpen(false);
                  },
                  "aria-label": "Schliessen",
                  "data-ocid": "landing.benefits.onepager.close_button",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20, style: { color: "#fff" } })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: "/assets/onepager_hreport_2.png",
                  alt: "Technologie-Onepager",
                  className: "max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function PricingSection({
  onRegister
}) {
  const { actor, isFetching } = useActor(createActor);
  const [billingMode, setBillingMode] = reactExports.useState(
    "jaehrlich"
  );
  const FEATURE_LABELS = {
    dashboard: "Dashboard",
    "time-tracking": "Zeiterfassung",
    "expense-tracking": "Spesenerfassung",
    calendar: "Kalenderübersicht",
    reports: "Auswertungen",
    invoicing: "Fakturierung",
    "master-data": "Stammdaten",
    approvals: "Genehmigungen",
    "hr-compliance": "HR & Compliance",
    settings: "Einstellungen"
  };
  const { data: backendPlans, isLoading } = useQuery({
    queryKey: ["publicSubscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getSubscriptionPlans() ?? [];
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1e3
  });
  const mappedPlans = backendPlans && backendPlans.length > 0 ? backendPlans.map((plan) => {
    const featureLabels = plan.features.filter((k) => k in FEATURE_LABELS).map((k) => FEATURE_LABELS[k]);
    const featureLabelsLower = featureLabels.map(
      (l) => l.toLowerCase().trim()
    );
    const additionalDeduped = (plan.additionalFeatures ?? []).filter(
      (a) => !featureLabelsLower.includes(a.toLowerCase().trim())
    );
    const allFeatures = [
      ...new Set(
        [...featureLabels, ...additionalDeduped].map((t) => t.trim()).filter(Boolean)
      )
    ];
    const isFree = plan.pricePerMonthCHF === 0 && plan.pricePerYearCHF === 0;
    return {
      id: plan.id,
      tier: plan.name,
      description: plan.description ?? "",
      priceMonthly: plan.pricePerMonthCHF,
      priceYearly: plan.pricePerYearCHF,
      isFree,
      highlight: plan.isRecommended ?? false,
      features: allFeatures,
      cta: "Jetzt starten"
    };
  }) : [];
  const getPriceDisplay = (plan) => {
    if (plan.isFree) return { main: "Kostenlos", note: "Für immer gratis" };
    if (billingMode === "monatlich") {
      return {
        main: `CHF ${plan.priceMonthly.toFixed(2)}`,
        note: "pro Mitarbeiter / Monat im Monats-Abonnement"
      };
    }
    return {
      main: `CHF ${plan.priceYearly.toFixed(2)}`,
      note: "pro Mitarbeiter / Monat im Jahres-Abonnement"
    };
  };
  const handleCtaClick = (plan) => {
    onRegister(plan.id, billingMode === "jaehrlich" ? "yearly" : "monthly");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      id: "preise",
      className: "w-full py-20",
      style: { backgroundColor: "#f4f7fb" },
      "data-ocid": "landing.pricing.section",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1280px] mx-auto px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              className: "text-3xl md:text-4xl font-bold mb-4",
              style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
              children: "Einfache Preise"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg max-w-xl mx-auto", style: { color: "#555e6e" }, children: "Transparent und fair – kein Kleingedrucktes, keine versteckten Gebühren." })
        ] }),
        !isLoading && mappedPlans.some((p) => !p.isFree) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "inline-flex items-center rounded-xl p-1 gap-0.5",
            style: {
              backgroundColor: "#e2eaf2",
              border: "1px solid rgba(10,74,117,0.12)"
            },
            "aria-label": "Abrechnungsmodell wählen",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setBillingMode("monatlich"),
                  className: "px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                  style: {
                    backgroundColor: billingMode === "monatlich" ? "#ffffff" : "transparent",
                    color: billingMode === "monatlich" ? "#0A4A75" : "#6b7a8d",
                    boxShadow: billingMode === "monatlich" ? "0 1px 4px rgba(10,74,117,0.12)" : "none",
                    fontFamily: "'Play', sans-serif"
                  },
                  "data-ocid": "landing.pricing.billing_monthly_toggle",
                  children: "Monatlich"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setBillingMode("jaehrlich"),
                  className: "px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                  style: {
                    backgroundColor: billingMode === "jaehrlich" ? "#ffffff" : "transparent",
                    color: billingMode === "jaehrlich" ? "#0A4A75" : "#6b7a8d",
                    boxShadow: billingMode === "jaehrlich" ? "0 1px 4px rgba(10,74,117,0.12)" : "none",
                    fontFamily: "'Play', sans-serif"
                  },
                  "data-ocid": "landing.pricing.billing_yearly_toggle",
                  children: [
                    "Jährlich",
                    billingMode === "jaehrlich" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        style: {
                          backgroundColor: "#006066",
                          color: "#ffffff"
                        },
                        children: "Günstig"
                      }
                    )
                  ]
                }
              )
            ]
          }
        ) }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 gap-8 max-w-3xl mx-auto", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col gap-6 p-8 rounded-2xl border",
            style: {
              backgroundColor: "#ffffff",
              borderColor: "rgba(10,74,117,0.12)",
              minHeight: 360
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-24 bg-slate-200 rounded animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-32 bg-slate-200 rounded animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: [1, 2, 3, 4].map((j) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-3 w-full bg-slate-100 rounded animate-pulse"
                },
                j
              )) })
            ]
          },
          i
        )) }) : mappedPlans.length === 0 ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `grid gap-8 max-w-3xl mx-auto ${mappedPlans.length === 1 ? "md:grid-cols-1 max-w-sm" : "md:grid-cols-2"}`,
            children: mappedPlans.map((plan, i) => {
              const { main: priceMain, note: priceNote } = getPriceDisplay(plan);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex flex-col gap-5 p-8 rounded-2xl border",
                  style: {
                    backgroundColor: plan.highlight ? "#0A4A75" : "#ffffff",
                    borderColor: plan.highlight ? "#0A4A75" : "rgba(10,74,117,0.12)",
                    boxShadow: plan.highlight ? "0 8px 24px rgba(10,74,117,0.25)" : "0 1px 4px rgba(10,74,117,0.06)"
                  },
                  "data-ocid": `landing.pricing.item.${i + 1}`,
                  children: [
                    plan.highlight && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold",
                        style: {
                          backgroundColor: "#5090C1",
                          color: "#ffffff",
                          fontFamily: "'Play', sans-serif"
                        },
                        children: "Empfohlen"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          className: "text-sm font-semibold mb-1",
                          style: {
                            color: plan.highlight ? "rgba(255,255,255,0.65)" : "#1F6495",
                            fontFamily: "'Play', sans-serif"
                          },
                          children: plan.tier
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          className: "text-4xl font-bold",
                          style: {
                            color: plan.highlight ? "#ffffff" : "#0A4A75",
                            fontFamily: "'Play', sans-serif"
                          },
                          children: priceMain
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          className: "text-sm mt-1",
                          style: {
                            color: plan.highlight ? "rgba(255,255,255,0.55)" : "#94a3b8"
                          },
                          children: priceNote
                        }
                      ),
                      plan.description && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          className: "text-sm mt-2",
                          style: {
                            color: plan.highlight ? "rgba(255,255,255,0.70)" : "#4a5568"
                          },
                          children: plan.description
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-2.5", children: plan.features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "li",
                      {
                        className: "flex items-center gap-2.5 text-sm",
                        style: {
                          color: plan.highlight ? "rgba(255,255,255,0.85)" : "#4a5568"
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Check,
                            {
                              size: 14,
                              style: {
                                color: plan.highlight ? "#5090C1" : "#1F6495",
                                flexShrink: 0
                              }
                            }
                          ),
                          f
                        ]
                      },
                      f
                    )) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleCtaClick(plan),
                        disabled: false,
                        className: "w-full py-3 rounded-lg text-sm font-bold transition-all duration-200",
                        style: {
                          backgroundColor: plan.highlight ? "#5090C1" : "transparent",
                          color: plan.highlight ? "#ffffff" : "#0A4A75",
                          border: plan.highlight ? "none" : "2px solid #0A4A75",
                          fontFamily: "'Play', sans-serif"
                        },
                        onMouseEnter: (e) => {
                          if (plan.highlight) {
                            e.currentTarget.style.backgroundColor = "#1F6495";
                          } else {
                            e.currentTarget.style.backgroundColor = "#0A4A75";
                            e.currentTarget.style.color = "#ffffff";
                          }
                        },
                        onMouseLeave: (e) => {
                          if (plan.highlight) {
                            e.currentTarget.style.backgroundColor = "#5090C1";
                          } else {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#0A4A75";
                          }
                        },
                        "data-ocid": `landing.pricing.cta.${i + 1}`,
                        children: plan.cta
                      }
                    )
                  ]
                },
                plan.tier
              );
            })
          }
        )
      ] })
    }
  );
}
function FaqSection() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      id: "faq",
      className: "w-full py-20 bg-white",
      "data-ocid": "landing.faq.section",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[800px] mx-auto px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-14", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              className: "text-3xl md:text-4xl font-bold mb-4",
              style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
              children: "Häufige Fragen"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", style: { color: "#555e6e" }, children: "Du hast Fragen? Wir haben Antworten." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Accordion, { type: "single", collapsible: true, className: "flex flex-col gap-2", children: FAQS.map((faq, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          AccordionItem,
          {
            value: faq.id,
            className: "rounded-xl border px-6",
            style: { borderColor: "rgba(10,74,117,0.12)" },
            "data-ocid": `landing.faq.item.${i + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AccordionTrigger,
                {
                  className: "text-left text-sm font-semibold py-4 hover:no-underline",
                  style: { color: "#0A4A75", fontFamily: "'Play', sans-serif" },
                  children: faq.q
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AccordionContent,
                {
                  className: "text-sm leading-relaxed pb-4",
                  style: { color: "#64748b" },
                  children: faq.a
                }
              )
            ]
          },
          faq.id
        )) })
      ] })
    }
  );
}
function FooterLink({
  href,
  external,
  ocid,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "a",
    {
      href,
      target: external ? "_blank" : void 0,
      rel: external ? "noopener noreferrer" : void 0,
      className: "text-xs transition-colors duration-150",
      style: { color: "rgba(255,255,255,0.65)" },
      onMouseEnter: (e) => {
        e.currentTarget.style.color = "#ffffff";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.color = "rgba(255,255,255,0.65)";
      },
      "data-ocid": ocid,
      children
    }
  );
}
function LandingFooter() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "footer",
    {
      className: "w-full py-10",
      style: { backgroundColor: "#0A4A75" },
      "data-ocid": "landing.footer",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center md:items-start gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: "/assets/logo_transparent.png",
              alt: "iReport",
              style: { height: "135px", width: "auto", marginBottom: "4px" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", style: { color: "rgba(255,255,255,0.55)" }, children: [
            "© ",
            year,
            " iServices AG · Schuppisstrasse 2 · 8057 Zürich"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          FooterLink,
          {
            href: "/nutzungsbedingungen",
            ocid: "landing.footer.nutzungsbedingungen_link",
            children: "Nutzungsbedingungen"
          }
        ) })
      ] })
    }
  );
}
function LandingPage() {
  const { identity, isLoggingIn: iiLoggingIn, login } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor(createActor);
  const { isAuthenticated, setAuthenticated, setLoading } = useAuthStore();
  const navigate = useNavigate();
  const isInitializing = reactExports.useRef(false);
  const [sessionLoading, setSessionLoading] = reactExports.useState(false);
  const isLoggingIn = iiLoggingIn || sessionLoading;
  reactExports.useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);
  const initializeSession = reactExports.useCallback(async () => {
    if (!actor || isActorFetching || isInitializing.current) return;
    isInitializing.current = true;
    setSessionLoading(true);
    setLoading(true);
    try {
      const registered = await toAny(actor).isRegistered();
      if (!registered) {
        setLoading(false);
        setSessionLoading(false);
        isInitializing.current = false;
        return;
      }
      const [companyResult, employeeResult] = await Promise.all([
        toAny(actor).getMyCompany(),
        toAny(actor).getMyEmployee()
      ]);
      if (companyResult.__kind__ !== "ok" || employeeResult.__kind__ !== "ok") {
        throw new Error("Fehler beim Laden der Benutzerdaten");
      }
      const company = companyResult.ok;
      const employee = employeeResult.ok;
      const principal = (identity == null ? void 0 : identity.getPrincipal().toString()) ?? "";
      const appRole = employee.role;
      setAuthenticated(
        principal,
        appRole,
        String(company.id),
        String(employee.id),
        company.name,
        `${employee.firstName} ${employee.lastName}`,
        company.logoUrl ?? null
      );
      setSessionLoading(false);
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("Fehler beim Laden der Benutzerdaten:", err);
      setLoading(false);
      setSessionLoading(false);
      isInitializing.current = false;
    }
  }, [
    actor,
    isActorFetching,
    identity,
    setAuthenticated,
    setLoading,
    navigate
  ]);
  reactExports.useEffect(() => {
    if (identity && actor && !isActorFetching && !isAuthenticated && !isInitializing.current) {
      void initializeSession();
    }
  }, [identity, actor, isActorFetching, isAuthenticated, initializeSession]);
  reactExports.useEffect(() => {
    if (!identity) {
      isInitializing.current = false;
      setSessionLoading(false);
    }
  }, [identity]);
  const handleLogin = () => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
      return;
    }
    login();
  };
  const handleRegister = (planId, billing) => {
    navigate({
      to: "/register",
      search: { planId, billing }
    });
  };
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("scroll") === "pricing") {
      const el = document.getElementById("preise");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen flex flex-col",
      style: { fontFamily: "'Play', sans-serif", backgroundColor: "#0A4A75" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LandingNav, { onLogin: handleLogin, isLoggingIn }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 pt-24", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeroSection, { onLogin: handleLogin, isLoggingIn }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureGrid, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TeamSection, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AvailabilitySection, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NoInstallSection, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BenefitsSection, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PricingSection, { onRegister: handleRegister }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FaqSection, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LandingFooter, {})
      ]
    }
  );
}
export {
  LandingPage as default
};
