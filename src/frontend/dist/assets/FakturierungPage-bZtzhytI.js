import { b as useSearch, r as reactExports, j as jsxRuntimeExports, a as useNavigate, S as Skeleton, e as useQueryClient } from "./index-D_yjRFGt.js";
import { B as Badge } from "./badge-BPk2SywW.js";
import { B as Button } from "./button-BXNzWYpr.js";
import { C as Card, a as CardContent } from "./card-Cqx-QXhC.js";
import { L as Layout, j as Checkbox } from "./Layout-BOoVnXJI.js";
import { L as Label, I as Input, u as ue } from "./index-SoMYIp0N.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CXihOV-A.js";
import { u as useActor, d as useAuth, b as useQuery, c as createActor } from "./useAuthStore-RPelH0kd.js";
import { R as Receipt, F as FileText, C as ChevronDown, h as ChevronRight } from "./x-BHvIGru9.js";
import { P as Plus } from "./plus-1FdrTAyc.js";
import "./index-HGa3Ynxo.js";
import "./createLucideIcon-C599ATMm.js";
import "./loader-circle-DPIlcj_m.js";
const toAny = (a) => a;
function formatDateCH(dateStr) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}
function formatCurrency(n, currency = "CHF") {
  return `${n.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}
function formatHours(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
function getFirstDayOfMonth() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function getTodayString() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
const statusConfig = {
  entwurf: { label: "Entwurf", className: "bg-muted text-muted-foreground" },
  versendet: { label: "Versendet", className: "bg-blue-100 text-blue-700" },
  bezahlt: { label: "Bezahlt", className: "bg-green-100 text-green-700" },
  storniert: { label: "Storniert", className: "bg-red-100 text-red-700" },
  ueberfaellig: {
    label: "Überfällig",
    className: "bg-orange-100 text-orange-700"
  }
};
function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? statusConfig.entwurf;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`,
      children: cfg.label
    }
  );
}
function UnfakturiertView({
  actor,
  actorFetching,
  isAuthenticated,
  projects,
  customers,
  employees,
  projectMembersMap,
  onCreatedMultiKunde
}) {
  const navigate = useNavigate();
  const [filterKunde, setFilterKunde] = reactExports.useState("");
  const [filterProjekt, setFilterProjekt] = reactExports.useState("");
  const [filterMitarbeiter, setFilterMitarbeiter] = reactExports.useState("");
  const [dateFrom, setDateFrom] = reactExports.useState(getFirstDayOfMonth());
  const [dateTo, setDateTo] = reactExports.useState(getTodayString());
  const [selected, setSelected] = reactExports.useState([]);
  const [expandedGroups, setExpandedGroups] = reactExports.useState(/* @__PURE__ */ new Set());
  const projMap = reactExports.useMemo(
    () => new Map(projects.map((p) => [String(p.id), p])),
    [projects]
  );
  const custMap = reactExports.useMemo(
    () => new Map(customers.map((c) => [String(c.id), c])),
    [customers]
  );
  const empMap = reactExports.useMemo(
    () => new Map(
      employees.map((e) => [String(e.id), `${e.firstName} ${e.lastName}`])
    ),
    [employees]
  );
  const { data: unbilled, isLoading } = useQuery({
    queryKey: ["unbilled"],
    queryFn: async () => {
      if (!actor)
        return { zeiteintraege: [], spesen: [] };
      const res = await toAny(actor).getUnbilledEntries(null);
      if (res.__kind__ === "ok" && res.ok) return res.ok;
      return { zeiteintraege: [], spesen: [] };
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const entries = reactExports.useMemo(() => {
    const result = [];
    const ze = (unbilled == null ? void 0 : unbilled.zeiteintraege) ?? [];
    const sp = (unbilled == null ? void 0 : unbilled.spesen) ?? [];
    for (const t of ze) {
      const proj = projMap.get(String(t.projectId));
      const cust = proj ? custMap.get(String(proj.customerId)) : void 0;
      const members = projectMembersMap.get(String(t.projectId)) ?? [];
      const assignment = members.find(
        (m) => String(m.employeeId) === String(t.employeeId) && String(m.serviceTypeId) === String(t.serviceTypeId)
      );
      const stundensatz = (assignment == null ? void 0 : assignment.stundensatz) ?? 0;
      result.push({
        id: t.id,
        typ: "zeiteintrag",
        employeeId: t.employeeId,
        employeeName: empMap.get(String(t.employeeId)) ?? String(t.employeeId),
        projectId: t.projectId,
        projectName: (proj == null ? void 0 : proj.name) ?? String(t.projectId),
        customerId: (proj == null ? void 0 : proj.customerId) ?? BigInt(0),
        customerName: (cust == null ? void 0 : cust.name) ?? "-",
        date: t.date,
        description: t.description,
        hours: t.hours,
        stundensatz,
        totalCHF: t.hours * stundensatz
      });
    }
    for (const e of sp) {
      if (e.status !== "approved") continue;
      if (!e.billableCHF || e.billableCHF <= 0) continue;
      const proj = e.projektId ? projMap.get(String(e.projektId)) : void 0;
      const cust = e.kundeId ? custMap.get(String(e.kundeId)) : proj ? custMap.get(String(proj.customerId)) : void 0;
      result.push({
        id: e.id,
        typ: "spese",
        employeeId: e.employeeId,
        employeeName: empMap.get(String(e.employeeId)) ?? String(e.employeeId),
        projectId: e.projektId ?? BigInt(0),
        projectName: (proj == null ? void 0 : proj.name) ?? "-",
        customerId: e.kundeId ?? (proj == null ? void 0 : proj.customerId) ?? BigInt(0),
        customerName: (cust == null ? void 0 : cust.name) ?? "-",
        date: e.date,
        description: e.description,
        betragCHF: e.billableCHF,
        totalCHF: e.billableCHF
      });
    }
    return result;
  }, [unbilled, projMap, custMap, empMap, projectMembersMap]);
  const dateFiltered = reactExports.useMemo(() => {
    return entries.filter((e) => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [entries, dateFrom, dateTo]);
  const distinctKunden = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const e of dateFiltered) {
      if (e.customerId) map.set(String(e.customerId), e.customerName);
    }
    return Array.from(map.entries());
  }, [dateFiltered]);
  const distinctProjekte = reactExports.useMemo(() => {
    const filtered2 = filterKunde ? dateFiltered.filter((e) => String(e.customerId) === filterKunde) : dateFiltered;
    const map = /* @__PURE__ */ new Map();
    for (const e of filtered2) {
      if (e.projectId) map.set(String(e.projectId), e.projectName);
    }
    return Array.from(map.entries());
  }, [dateFiltered, filterKunde]);
  const distinctMitarbeiter = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const e of dateFiltered) map.set(String(e.employeeId), e.employeeName);
    return Array.from(map.entries());
  }, [dateFiltered]);
  const filtered = reactExports.useMemo(() => {
    return dateFiltered.filter((e) => {
      if (filterKunde && String(e.customerId) !== filterKunde) return false;
      if (filterProjekt && String(e.projectId) !== filterProjekt) return false;
      if (filterMitarbeiter && String(e.employeeId) !== filterMitarbeiter)
        return false;
      return true;
    });
  }, [dateFiltered, filterKunde, filterProjekt, filterMitarbeiter]);
  const grouped = reactExports.useMemo(() => {
    const kundeMap = /* @__PURE__ */ new Map();
    for (const e of filtered) {
      const ck = String(e.customerId);
      if (!kundeMap.has(ck)) {
        kundeMap.set(ck, {
          customerId: e.customerId,
          customerName: e.customerName,
          projekte: []
        });
      }
      const kg = kundeMap.get(ck);
      const pk = String(e.projectId);
      let pg = kg.projekte.find((p) => String(p.projectId) === pk);
      if (!pg) {
        pg = {
          projectId: e.projectId,
          projectName: e.projectName,
          mitarbeiter: []
        };
        kg.projekte.push(pg);
      }
      const mk = String(e.employeeId);
      let mg = pg.mitarbeiter.find((m) => String(m.employeeId) === mk);
      if (!mg) {
        mg = {
          employeeId: e.employeeId,
          employeeName: e.employeeName,
          entries: []
        };
        pg.mitarbeiter.push(mg);
      }
      mg.entries.push(e);
    }
    return Array.from(kundeMap.values()).sort(
      (a, b) => a.customerName.localeCompare(b.customerName, "de")
    );
  }, [filtered]);
  const selKey = reactExports.useMemo(
    () => (e) => `${e.typ}:${String(e.id)}`,
    []
  );
  const selectedSet = reactExports.useMemo(
    () => new Set(selected.map(selKey)),
    [selected, selKey]
  );
  function toggleEntry(e) {
    const k = selKey(e);
    if (selectedSet.has(k)) {
      setSelected((s) => s.filter((x) => selKey(x) !== k));
    } else {
      setSelected((s) => [...s, e]);
    }
  }
  function isGroupSelected(entries2) {
    return entries2.every(
      (e) => selectedSet.has(selKey({ id: e.id, typ: e.typ }))
    );
  }
  function toggleGroup(entries2, forceState) {
    const allSelected = forceState ?? !isGroupSelected(entries2);
    const keys = entries2.map((e) => selKey({ id: e.id, typ: e.typ }));
    if (allSelected) {
      const toAdd = entries2.filter(
        (e) => !selectedSet.has(selKey({ id: e.id, typ: e.typ }))
      );
      setSelected((s) => [
        ...s,
        ...toAdd.map((e) => ({ id: e.id, typ: e.typ }))
      ]);
    } else {
      setSelected((s) => s.filter((x) => !keys.includes(selKey(x))));
    }
  }
  function toggleExpand(key) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  const [isCreating, setIsCreating] = reactExports.useState(false);
  function handleCreateInvoice() {
    const selEntries = filtered.filter(
      (e) => selectedSet.has(selKey({ id: e.id, typ: e.typ }))
    );
    const kundeOrder = [];
    const byKunde = /* @__PURE__ */ new Map();
    for (const e of selEntries) {
      const ck = String(e.customerId);
      if (!byKunde.has(ck)) {
        byKunde.set(ck, []);
        kundeOrder.push(ck);
      }
      byKunde.get(ck).push(e);
    }
    if (kundeOrder.length === 0) return;
    const firstKundeId = kundeOrder[0];
    const firstEntries = byKunde.get(firstKundeId);
    const firstZeitIds = firstEntries.filter((e) => e.typ === "zeiteintrag").map((e) => e.id);
    const firstSpeseIds = firstEntries.filter((e) => e.typ === "spese").map((e) => e.id);
    if (kundeOrder.length > 1 && actor) {
      setIsCreating(true);
      const otherKundenPromises = kundeOrder.slice(1).map(async (ck) => {
        const entries2 = byKunde.get(ck);
        const zeitIds = entries2.filter((e) => e.typ === "zeiteintrag").map((e) => e.id);
        const speseIds = entries2.filter((e) => e.typ === "spese").map((e) => e.id);
        try {
          await toAny(actor).createInvoice({
            kundeId: BigInt(ck),
            kopftext: "",
            fusstext: "",
            positionen: entries2.map((e) => ({
              typ: e.typ === "zeiteintrag" ? "leistung" : "spese",
              referenzId: e.id,
              bezeichnung: e.description || (e.typ === "zeiteintrag" ? "Leistung" : "Spese"),
              menge: e.hours ?? 1,
              einheit: e.typ === "zeiteintrag" ? "Std." : "Pauschal",
              preis: e.totalCHF
            })),
            mwstSatz: 7.7,
            rabatt: 0,
            skonto: 0
          });
          const anyActor = toAny(actor);
          const res = await anyActor.getInvoices();
          if (res.__kind__ === "ok" && res.ok) {
            const inv = [...res.ok].sort((a, b) => Number(b.id) - Number(a.id)).find((i) => String(i.kundeId) === ck);
            if (inv) {
              await anyActor.markFakturiert(inv.id, zeitIds, speseIds);
            }
          }
        } catch {
        }
      });
      Promise.all(otherKundenPromises).then(() => {
        setIsCreating(false);
        if (onCreatedMultiKunde) onCreatedMultiKunde();
        navigate({
          to: "/fakturierung/rechnung/neu",
          search: {
            zeitIds: firstZeitIds.map(String).join(","),
            speseIds: firstSpeseIds.map(String).join(","),
            kundeId: firstKundeId
          }
        });
      });
    } else {
      navigate({
        to: "/fakturierung/rechnung/neu",
        search: {
          zeitIds: firstZeitIds.map(String).join(","),
          speseIds: firstSpeseIds.map(String).join(","),
          kundeId: firstKundeId
        }
      });
    }
  }
  const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-4 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Datum von" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: dateFrom,
            onChange: (e) => setDateFrom(e.target.value),
            "data-ocid": "unbilled.date-from"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Datum bis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: dateTo,
            onChange: (e) => setDateTo(e.target.value),
            "data-ocid": "unbilled.date-to"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Kunde" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filterKunde,
            onChange: (e) => {
              setFilterKunde(e.target.value);
              setFilterProjekt("");
            },
            className: selectClass,
            "data-ocid": "unbilled.filter-kunde",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle" }),
              distinctKunden.map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, children: name }, id))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Projekt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filterProjekt,
            onChange: (e) => setFilterProjekt(e.target.value),
            className: selectClass,
            "data-ocid": "unbilled.filter-projekt",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle" }),
              distinctProjekte.map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, children: name }, id))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Mitarbeiter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filterMitarbeiter,
            onChange: (e) => setFilterMitarbeiter(e.target.value),
            className: selectClass,
            "data-ocid": "unbilled.filter-mitarbeiter",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle" }),
              distinctMitarbeiter.map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, children: name }, id))
            ]
          }
        )
      ] })
    ] }) }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" })
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground",
        "data-ocid": "unbilled.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-12 h-12 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Keine nicht fakturierten Leistungen vorhanden" })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: grouped.map((kg) => {
      const kundeKey = `k:${String(kg.customerId)}`;
      const kundeExpanded = expandedGroups.has(kundeKey);
      const allKundeEntries = kg.projekte.flatMap(
        (p) => p.mitarbeiter.flatMap((m) => m.entries)
      );
      const kundeTotal = allKundeEntries.reduce(
        (s, e) => s + e.totalCHF,
        0
      );
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: "flex items-center gap-3 px-4 py-3 bg-primary/5 border-b cursor-pointer select-none w-full text-left",
            onClick: () => toggleExpand(kundeKey),
            "data-ocid": `unbilled.kunde-${String(kg.customerId)}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: isGroupSelected(allKundeEntries),
                  onCheckedChange: (v) => {
                    toggleGroup(allKundeEntries, !!v);
                  },
                  onClick: (e) => e.stopPropagation(),
                  "data-ocid": `unbilled.kunde-checkbox-${String(kg.customerId)}`
                }
              ),
              kundeExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground flex-1", children: kg.customerName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-primary", children: formatCurrency(kundeTotal) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "ml-2", children: [
                allKundeEntries.length,
                " Pos."
              ] })
            ]
          }
        ),
        kundeExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: kg.projekte.map((pg) => {
          const projKey = `p:${String(kg.customerId)}:${String(pg.projectId)}`;
          const projExpanded = expandedGroups.has(projKey);
          const allProjEntries = pg.mitarbeiter.flatMap(
            (m) => m.entries
          );
          const projTotal = allProjEntries.reduce(
            (s, e) => s + e.totalCHF,
            0
          );
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: "flex items-center gap-3 px-6 py-2.5 bg-muted/30 cursor-pointer select-none w-full text-left",
                onClick: () => toggleExpand(projKey),
                "data-ocid": `unbilled.projekt-${String(pg.projectId)}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Checkbox,
                    {
                      checked: isGroupSelected(allProjEntries),
                      onCheckedChange: (v) => {
                        toggleGroup(allProjEntries, !!v);
                      },
                      onClick: (e) => e.stopPropagation(),
                      "data-ocid": `unbilled.projekt-checkbox-${String(pg.projectId)}`
                    }
                  ),
                  projExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3.5 h-3.5 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm flex-1", children: pg.projectName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-muted-foreground", children: formatCurrency(projTotal) })
                ]
              }
            ),
            projExpanded && pg.mitarbeiter.map((mg) => {
              const maKey = `m:${String(pg.projectId)}:${String(mg.employeeId)}`;
              const maExpanded = expandedGroups.has(maKey);
              const maTotal = mg.entries.reduce(
                (s, e) => s + e.totalCHF,
                0
              );
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    className: "flex items-center gap-3 px-8 py-2 bg-background cursor-pointer select-none w-full text-left",
                    onClick: () => toggleExpand(maKey),
                    "data-ocid": `unbilled.ma-${String(mg.employeeId)}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Checkbox,
                        {
                          checked: isGroupSelected(mg.entries),
                          onCheckedChange: (v) => {
                            toggleGroup(mg.entries, !!v);
                          },
                          onClick: (e) => e.stopPropagation(),
                          "data-ocid": `unbilled.ma-checkbox-${String(mg.employeeId)}`
                        }
                      ),
                      maExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3 h-3 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3 text-muted-foreground" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm flex-1 text-muted-foreground", children: mg.employeeName }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: formatCurrency(maTotal) })
                    ]
                  }
                ),
                maExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/20", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-8 pl-10" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Datum" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Typ" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Beschreibung" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right text-xs", children: "Dauer / Betrag" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right text-xs", children: "Stundensatz" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right text-xs", children: "Total" })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
                    mg.entries.map((e, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      TableRow,
                      {
                        "data-ocid": `unbilled.item.${idx + 1}`,
                        className: selectedSet.has(
                          selKey({
                            id: e.id,
                            typ: e.typ
                          })
                        ) ? "bg-primary/5" : "",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "pl-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Checkbox,
                            {
                              checked: selectedSet.has(
                                selKey({
                                  id: e.id,
                                  typ: e.typ
                                })
                              ),
                              onCheckedChange: () => toggleEntry({
                                id: e.id,
                                typ: e.typ
                              }),
                              "data-ocid": `unbilled.checkbox.${idx + 1}`
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: formatDateCH(e.date) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Badge,
                            {
                              variant: "outline",
                              className: "text-xs",
                              children: e.typ === "zeiteintrag" ? "Zeit" : "Spese"
                            }
                          ) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground max-w-[200px] truncate", children: e.description || "-" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-xs tabular-nums", children: e.hours !== void 0 ? formatHours(e.hours) : e.betragCHF !== void 0 ? `${e.betragCHF.toFixed(2)} CHF` : "-" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-xs tabular-nums", children: e.stundensatz !== void 0 ? `${e.stundensatz.toFixed(2)}` : "-" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-xs tabular-nums font-medium", children: e.totalCHF.toFixed(2) })
                        ]
                      },
                      `${e.typ}:${String(e.id)}`
                    )),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/20 border-t", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        TableCell,
                        {
                          colSpan: 6,
                          className: "pl-10 text-xs font-semibold",
                          children: [
                            "Subtotal ",
                            mg.employeeName
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-xs font-semibold tabular-nums", children: maTotal.toFixed(2) })
                    ] })
                  ] })
                ] }) })
              ] }, maKey);
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-1.5 bg-muted/10 border-t text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-medium", children: [
                "Subtotal ",
                pg.projectName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums font-semibold", children: formatCurrency(projTotal) })
            ] })
          ] }, projKey);
        }) })
      ] }, kundeKey);
    }) }),
    selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-card border border-border rounded-xl shadow-lg",
        "data-ocid": "unbilled.action-bar",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-bold", children: selected.length }),
            " ",
            "Position",
            selected.length !== 1 ? "en" : "",
            " ausgewählt"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: handleCreateInvoice,
              className: "gap-2",
              disabled: isCreating,
              "data-ocid": "unbilled.create-invoice-button",
              children: [
                isCreating ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-4 h-4" }),
                "Rechnung erstellen"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setSelected([]),
              "data-ocid": "unbilled.clear-selection",
              children: "Auswahl aufheben"
            }
          )
        ]
      }
    )
  ] });
}
function RechnungsübersichtView({
  actor,
  actorFetching,
  isAuthenticated,
  customers,
  initialFilterStatus = ""
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = reactExports.useState(initialFilterStatus);
  const filterStatusInitRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!filterStatusInitRef.current && initialFilterStatus) {
      setFilterStatus(initialFilterStatus);
      filterStatusInitRef.current = true;
    }
  }, [initialFilterStatus]);
  const [filterKunde, setFilterKunde] = reactExports.useState("");
  const [dateFrom, setDateFrom] = reactExports.useState("");
  const [dateTo, setDateTo] = reactExports.useState("");
  const [sortField, setSortField] = reactExports.useState("datum");
  const [sortDir, setSortDir] = reactExports.useState("desc");
  const custMap = reactExports.useMemo(
    () => new Map(customers.map((c) => [String(c.id), c])),
    [customers]
  );
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      if (!actor) return [];
      const res = await toAny(actor).getInvoices();
      if (res.__kind__ === "ok" && res.ok) return res.ok;
      return [];
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const filtered = reactExports.useMemo(() => {
    return invoices.filter((inv) => {
      if (filterStatus && inv.status !== filterStatus) return false;
      if (filterKunde && String(inv.kundeId) !== filterKunde) return false;
      if (dateFrom && inv.datum < dateFrom) return false;
      if (dateTo && inv.datum > dateTo) return false;
      return true;
    });
  }, [invoices, filterStatus, filterKunde, dateFrom, dateTo]);
  const sorted = reactExports.useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "datum") cmp = a.datum.localeCompare(b.datum);
      else if (sortField === "rechnungsnummer")
        cmp = a.rechnungsnummer.localeCompare(b.rechnungsnummer);
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);
  function toggleSort(field) {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDir("desc");
    }
  }
  async function handleDelete(inv) {
    if (!actor) return;
    if (!confirm(`Rechnung ${inv.rechnungsnummer} wirklich löschen?`)) return;
    const res = await toAny(actor).deleteInvoice(inv.id);
    if (res.__kind__ === "ok") {
      ue.success("Rechnung gelöscht");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } else {
      ue.error("Fehler beim Löschen");
    }
  }
  async function handleStornieren(inv) {
    if (!actor) return;
    if (!confirm(`Rechnung ${inv.rechnungsnummer} wirklich stornieren?`))
      return;
    const res = await toAny(actor).updateInvoice(inv.id, {
      status: "storniert"
    });
    if (res.__kind__ === "ok") {
      ue.success("Rechnung storniert");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } else {
      ue.error("Fehler beim Stornieren");
    }
  }
  const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const distinctKunden = reactExports.useMemo(() => {
    var _a;
    const map = /* @__PURE__ */ new Map();
    for (const inv of invoices)
      map.set(
        String(inv.kundeId),
        ((_a = custMap.get(String(inv.kundeId))) == null ? void 0 : _a.name) ?? String(inv.kundeId)
      );
    return Array.from(map.entries());
  }, [invoices, custMap]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-end gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Kunde" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterKunde,
              onChange: (e) => setFilterKunde(e.target.value),
              className: selectClass,
              "data-ocid": "invoices.filter-kunde",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle" }),
                distinctKunden.map(([id, name]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, children: name }, id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterStatus,
              onChange: (e) => setFilterStatus(e.target.value),
              className: selectClass,
              "data-ocid": "invoices.filter-status",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Alle" }),
                Object.entries(statusConfig).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v.label }, k))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Datum von" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: dateFrom,
              onChange: (e) => setDateFrom(e.target.value),
              "data-ocid": "invoices.date-from"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Datum bis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: dateTo,
              onChange: (e) => setDateTo(e.target.value),
              "data-ocid": "invoices.date-to"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => navigate({ to: "/fakturierung" }),
          variant: "outline",
          className: "gap-2 whitespace-nowrap",
          "data-ocid": "invoices.new-button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Neue Rechnung"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" })
    ] }) : sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground",
        "data-ocid": "invoices.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-12 h-12 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Noch keine Rechnungen vorhanden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => navigate({ to: "/fakturierung" }),
              "data-ocid": "invoices.goto-unbilled",
              children: "Zu den offenen Leistungen"
            }
          )
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableHead,
          {
            className: "cursor-pointer select-none",
            onClick: () => toggleSort("rechnungsnummer"),
            "data-ocid": "invoices.sort-nr",
            children: [
              "Rechnungsnummer",
              " ",
              sortField === "rechnungsnummer" ? sortDir === "asc" ? "↑" : "↓" : ""
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Kunde" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Betrag" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableHead,
          {
            className: "cursor-pointer select-none",
            onClick: () => toggleSort("datum"),
            "data-ocid": "invoices.sort-datum",
            children: [
              "Datum",
              " ",
              sortField === "datum" ? sortDir === "asc" ? "↑" : "↓" : ""
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fälligkeitsdatum" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableHead,
          {
            className: "cursor-pointer select-none",
            onClick: () => toggleSort("status"),
            "data-ocid": "invoices.sort-status",
            children: [
              "Status",
              " ",
              sortField === "status" ? sortDir === "asc" ? "↑" : "↓" : ""
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Aktionen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sorted.map((inv, idx) => {
        const kunde = custMap.get(String(inv.kundeId));
        const currency = (kunde == null ? void 0 : kunde.waehrung) ?? "CHF";
        const isOverdue = inv.status === "ueberfaellig";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            "data-ocid": `invoices.item.${idx + 1}`,
            className: isOverdue ? "bg-orange-50/50" : "",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-sm", children: inv.rechnungsnummer }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: (kunde == null ? void 0 : kunde.name) ?? String(inv.kundeId) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatCurrency(inv.total, currency) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateCH(inv.datum) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TableCell,
                {
                  className: isOverdue ? "text-orange-600 font-medium" : "",
                  children: formatDateCH(inv.faelligkeitsdatum)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: inv.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "text-xs h-7 px-2",
                    onClick: () => navigate({
                      to: `/fakturierung/rechnung/${String(inv.id)}`
                    }),
                    "data-ocid": `invoices.open-button.${idx + 1}`,
                    children: "Öffnen"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "text-xs h-7 px-2",
                    onClick: () => {
                      navigate({
                        to: `/fakturierung/rechnung/${String(inv.id)}`
                      });
                    },
                    "data-ocid": `invoices.pdf-button.${idx + 1}`,
                    children: "PDF"
                  }
                ),
                inv.status !== "bezahlt" && inv.status !== "storniert" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "text-xs h-7 px-2 text-destructive hover:text-destructive",
                    onClick: () => handleStornieren(inv),
                    "data-ocid": `invoices.stornieren-button.${idx + 1}`,
                    children: "Stornieren"
                  }
                ),
                inv.status === "entwurf" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "text-xs h-7 px-2 text-destructive hover:text-destructive",
                    onClick: () => handleDelete(inv),
                    "data-ocid": `invoices.delete-button.${idx + 1}`,
                    children: "Löschen"
                  }
                )
              ] }) })
            ]
          },
          String(inv.id)
        );
      }) })
    ] }) }) })
  ] });
}
function FakturierungPage() {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const { isAuthenticated } = useAuth();
  const search = useSearch({ strict: false });
  const urlTab = search == null ? void 0 : search.tab;
  const urlFilterStatus = search == null ? void 0 : search.filterStatus;
  const [activeTab, setActiveTab] = reactExports.useState(
    urlTab === "rechnungen" ? "rechnungen" : "leistungen"
  );
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listProjects();
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listCustomers();
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return await toAny(actor).listEmployees();
    },
    enabled: !!actor && !actorFetching && isAuthenticated
  });
  const [projectMembersMap, setProjectMembersMap] = reactExports.useState(/* @__PURE__ */ new Map());
  reactExports.useEffect(() => {
    if (!actor || actorFetching || projects.length === 0) return;
    const memberMap = /* @__PURE__ */ new Map();
    void Promise.all(
      projects.map(async (p) => {
        try {
          const res = await toAny(actor).getProjectMembers(p.id);
          if (res.__kind__ === "ok") memberMap.set(String(p.id), res.ok);
        } catch {
        }
      })
    ).then(() => setProjectMembersMap(new Map(memberMap)));
  }, [actor, actorFetching, projects]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "w-5 h-5 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-semibold text-foreground", children: "Fakturierung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Leistungen verrechnen und Rechnungen verwalten" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex gap-1 border-b border-border",
        "data-ocid": "fakturierung.tabs",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab("leistungen"),
              className: `px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "leistungen" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
              "data-ocid": "fakturierung.tab-leistungen",
              children: "Offene Leistungen"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab("rechnungen"),
              className: `px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === "rechnungen" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
              "data-ocid": "fakturierung.tab-rechnungen",
              children: "Rechnungen"
            }
          )
        ]
      }
    ),
    activeTab === "leistungen" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      UnfakturiertView,
      {
        actor,
        actorFetching,
        isAuthenticated,
        projects,
        customers,
        employees,
        projectMembersMap,
        onCreatedMultiKunde: () => setActiveTab("rechnungen")
      }
    ),
    activeTab === "rechnungen" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RechnungsübersichtView,
      {
        actor,
        actorFetching,
        isAuthenticated,
        customers,
        initialFilterStatus: urlFilterStatus ?? ""
      }
    )
  ] }) });
}
export {
  FakturierungPage as default
};
